import {
  BooleanNode,
  Case,
  EnumNode as RawEnumNode,
  ListNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Resource,
  StringNode,
  StringOrList,
  Switch,
  SwitchNode,
  INode,
  Path,
  ModelPath,
  NestedNodeChildren,
  MapNode,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'
import {
  LootTableTypes,
  LootContext,
  LootFunctions,
  LootConditions,
  LootEntitySources,
  LootCopySources
} from '../LootContext'
import { ConditionCases, Range } from './Common'

export function initLootTableSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const EnumNode = RawEnumNode.bind(undefined, collections)

  const conditions: NestedNodeChildren = {
    conditions: ListNode(
      Reference('loot_condition')
    )
  }

  const functionsAndConditions: NestedNodeChildren = {
    functions: ListNode(
      Reference('loot_function')
    ),
    ...conditions
  }

  function compileSwitchNode(contextMap: Map<string, LootContext[]>, collectionID: string, getNode: (type: string | string[]) => INode): INode {
    const cases: { match: (path: ModelPath) => boolean, node: INode }[] = []
    const getAvailableOptions = (providedContext: LootContext[]) => collections
      .get(collectionID)
      .filter(t => {
        const requiredContext = contextMap.get(t) ?? []
        return requiredContext.every(c => providedContext.includes(c))
      })
    for (const [tableType, { allows, requires }] of LootTableTypes) {
      const providedContext = [...allows, ...requires]
      cases.push({
        match: path => path.getModel().get(new Path(['type'])) === tableType,
        node: getNode(getAvailableOptions(providedContext))
      })
    }
    cases.push({ match: _ => true, node: getNode(collectionID) })
    return SwitchNode(cases)
  }

  const conditionSwtichNode = compileSwitchNode(LootConditions, 'loot_condition_type', type => Resource(EnumNode(type, { defaultValue: 'minecraft:random_chance', validation: { validator: 'resource', params: { pool: type instanceof Array ? type : `minecraft:loot_condition_type` } } })))
  const functionSwtichNode = compileSwitchNode(LootFunctions, 'loot_function_type', type => Resource(EnumNode(type, { defaultValue: 'minecraft:set_count', validation: { validator: 'resource', params: { pool: type instanceof Array ? type : `minecraft:loot_function_type` } } })))
  const entitySourceSwtichNode = compileSwitchNode(LootEntitySources, 'entity_source', type => EnumNode(type, 'this'))
  const copySourceSwtichNode = compileSwitchNode(LootCopySources, 'copy_source', type => EnumNode(type, 'this'))

  schemas.register('loot_table', Mod(ObjectNode({
    type: Opt(Resource(EnumNode('loot_context_type', { validation: { validator: "resource", params: { pool: collections.get('loot_context_type') } } }))),
    pools: Opt(ListNode(
      ObjectNode({
        rolls: Range({ allowBinomial: true, integer: true, min: 1 }),
        bonus_rolls: Opt(Range({ integer: true, min: 1 })),
        entries: ListNode(
          Reference('loot_entry')
        ),
        ...functionsAndConditions
      }, { context: 'loot_pool' })
    )),
    ...functionsAndConditions
  }, { context: 'loot_table' }), {
    default: () => ({
      pools: [{
        rolls: 1,
        entries: [{}]
      }]
    })
  }))

  const weightMod: Partial<INode> = {
    enabled: path => path.pop().get()?.length > 1
      && !['minecraft:alternatives', 'minecraft:group', 'minecraft:sequence'].includes(path.push('type').get())
  }

  schemas.register('loot_entry', ObjectNode({
    type: Resource(EnumNode('loot_pool_entry_type', { defaultValue: 'minecraft:item', validation: { validator: 'resource', params: { pool: 'minecraft:loot_pool_entry_type' } } })),
    weight: Opt(Mod(NumberNode({ integer: true, min: 1 }), weightMod)),
    quality: Opt(Mod(NumberNode({ integer: true, min: 1 }), weightMod)),
    [Switch]: path => path.push('type'),
    [Case]: {
      'minecraft:alternatives': {
        children: ListNode(
          Reference('loot_entry')
        ),
        ...functionsAndConditions
      },
      'minecraft:dynamic': {
        name: StringNode(),
        ...functionsAndConditions
      },
      'minecraft:group': {
        children: ListNode(
          Reference('loot_entry')
        ),
        ...functionsAndConditions
      },
      'minecraft:item': {
        name: Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } })),
        ...functionsAndConditions
      },
      'minecraft:loot_table': {
        name: Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$loot_table' } } })),
        ...functionsAndConditions
      },
      'minecraft:sequence': {
        children: ListNode(
          Reference('loot_entry')
        ),
        ...functionsAndConditions
      },
      'minecraft:tag': {
        name: Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$tag/item' } } })),
        expand: Opt(BooleanNode()),
        ...functionsAndConditions
      }
    }
  }, { context: 'loot_entry' }))

  schemas.register('loot_function', ObjectNode({
    function: functionSwtichNode,
    [Switch]: path => path.push('function'),
    [Case]: {
      'minecraft:apply_bonus': {
        enchantment: Resource(EnumNode('enchantment', { validation: { validator: 'resource', params: { pool: 'minecraft:enchantment' } } })),
        formula: Resource(Resource(EnumNode('loot_table_apply_bonus_formula', { defaultValue: 'minecraft:uniform_bonus_count', validation: { validator: 'resource', params: { pool: collections.get('loot_table_apply_bonus_formula') } } }))),
        parameters: Mod(ObjectNode({
          bonusMultiplier: Mod(NumberNode(), {
            enabled: path => path.pop().push('formula').get() === 'minecraft:uniform_bonus_count'
          }),
          extra: Mod(NumberNode(), {
            enabled: path => path.pop().push('formula').get() === 'minecraft:binomial_with_bonus_count'
          }),
          probability: Mod(NumberNode(), {
            enabled: path => path.pop().push('formula').get() === 'minecraft:binomial_with_bonus_count'
          })
        }), {
          enabled: path => path.push('formula').get() !== 'minecraft:ore_drops'
        }),
        ...conditions
      },
      'minecraft:copy_name': {
        source: copySourceSwtichNode,
        ...conditions
      },
      'minecraft:copy_nbt': {
        source: copySourceSwtichNode,
        ops: ListNode(
          ObjectNode({
            source: StringNode({ validation: { validator: 'nbt_path', params: { category: { getter: 'copy_source', path: ['pop', 'pop', 'pop', { push: 'source' }] } } } }),
            target: StringNode({ validation: { validator: 'nbt_path', params: { category: 'minecraft:item' } } }),
            op: EnumNode(['replace', 'append', 'merge'])
          }, { context: 'nbt_operation' })
        ),
        ...conditions
      },
      'minecraft:copy_state': {
        block: Resource(EnumNode('block', { validation: { validator: 'resource', params: { pool: 'minecraft:block' } } })),
        properties: ListNode(
          StringNode({ validation: { validator: 'block_state_key', params: { id: ['pop', 'pop', { push: 'block' }] } } })
        ),
        ...conditions
      },
      'minecraft:enchant_randomly': {
        enchantments: ListNode(
          Resource(EnumNode('enchantment', { validation: { validator: 'resource', params: { pool: 'minecraft:enchantment' } } }))
        ),
        ...conditions
      },
      'minecraft:enchant_with_levels': {
        levels: Range({ allowBinomial: true }),
        treasure: BooleanNode(),
        ...conditions
      },
      'minecraft:exploration_map': {
        destination: Opt(EnumNode('worldgen/structure_feature')),
        decoration: Opt(Resource(EnumNode('map_decoration', { validation: { validator: 'resource', params: { pool: collections.get('map_decoration') } } }))),
        zoom: Opt(NumberNode({ integer: true })),
        search_radius: Opt(NumberNode({ integer: true })),
        skip_existing_chunks: Opt(BooleanNode()),
        ...conditions
      },
      'minecraft:fill_player_head': {
        entity: entitySourceSwtichNode,
        ...conditions
      },
      'minecraft:limit_count': {
        limit: Range(),
        ...conditions
      },
      'minecraft:looting_enchant': {
        count: Range({ allowBinomial: true }),
        limit: Opt(NumberNode({ integer: true })),
        ...conditions
      },
      'minecraft:set_attributes': {
        modifiers: ListNode(
          Reference('attribute_modifier')
        ),
        ...conditions
      },
      'minecraft:set_contents': {
        entries: ListNode(
          Reference('loot_entry')
        ),
        ...conditions
      },
      'minecraft:set_count': {
        count: Range({ allowBinomial: true }),
        ...conditions
      },
      'minecraft:set_damage': {
        damage: Range({ allowBinomial: true }),
        ...conditions
      },
      'minecraft:set_loot_table': {
        name: Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$loot_table' } } })),
        seed: Opt(NumberNode({ integer: true }))
      },
      'minecraft:set_lore': {
        entity: entitySourceSwtichNode,
        lore: ListNode(
          Reference('text_component')
        ),
        replace: Opt(BooleanNode()),
        ...conditions
      },
      'minecraft:set_name': {
        entity: entitySourceSwtichNode,
        name: Reference('text_component'),
        ...conditions
      },
      'minecraft:set_nbt': {
        tag: StringNode({ validation: { validator: 'nbt', params: { registry: { category: 'minecraft:item' } } } }),
        ...conditions
      },
      'minecraft:set_stew_effect': {
        effects: Opt(ListNode(
          ObjectNode({
            type: EnumNode('mob_effect', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:mob_effect' } } }),
            duration: Range()
          })
        )),
        ...conditions
      }
    }
  }, { category: 'function', context: 'function' }))

  schemas.register('loot_condition', Mod(ObjectNode({
    condition: conditionSwtichNode,
    [Switch]: path => path.push('condition'),
    [Case]: {
      ...ConditionCases,
      'minecraft:entity_properties': {
        entity: entitySourceSwtichNode,
        predicate: Reference('entity_predicate')
      },
      'minecraft:entity_scores': {
        entity: entitySourceSwtichNode,
        scores: MapNode(
          StringNode({ validation: { validator: 'objective' } }),
          Range({ forceRange: true })
        )
      }
    }
  }), { category: 'predicate', context: 'condition' }))

  schemas.register('attribute_modifier', ObjectNode({
    attribute: Resource(EnumNode('attribute', { validation: { validator: 'resource', params: { pool: 'minecraft:attribute' } } })),
    name: StringNode(),
    amount: Range({ allowBinomial: true }),
    operation: EnumNode(['addition', 'multiply_base', 'multiply_total']),
    slot: StringOrList(
      EnumNode('slot')
    )
  }, { context: 'attribute_modifier' }))
}
