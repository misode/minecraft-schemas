import {
  BooleanNode,
  Case,
  EnumNode,
  Force,
  ListNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference,
  Resource,
  SCHEMAS,
  StringNode,
  StringOrList,
  Switch,
  SwitchNode,
  COLLECTIONS,
  INode,
  Path,
  ModelPath,
  NestedNodeChildren,
  MapNode,
} from '@mcschema/core'
import {
  LootTableTypes,
  LootContext,
  LootFunctions,
  LootConditions,
  LootEntitySources,
  LootCopySources
} from '../LootContext'
import { Range } from './Common'
import { ConditionCases } from './Condition'

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
  const getAvailableOptions = (providedContext: LootContext[]) => COLLECTIONS
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

SCHEMAS.register('loot_table', Mod(ObjectNode({
  type: Resource(EnumNode('loot_context_type', { validation: { validator: "resource", params: { pool: COLLECTIONS.get('loot_context_type') } } })),
  pools: Force(ListNode(
    ObjectNode({
      rolls: Force(Range({ allowBinomial: true, integer: true, min: 1 })),
      bonus_rolls: Range({ integer: true, min: 1 }),
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

SCHEMAS.register('loot_entry', ObjectNode({
  type: Resource(EnumNode('loot_pool_entry_type', { defaultValue: 'minecraft:item', validation: { validator: 'resource', params: { pool: 'minecraft:loot_pool_entry_type' } } })),
  weight: Mod(NumberNode({ integer: true, min: 1 }), {
    enabled: path => path.pop().get()?.length > 1
      && !['minecraft:alternatives', 'minecraft:group', 'minecraft:sequence'].includes(path.push('type').get())
  }),
  quality: Mod(NumberNode({ integer: true, min: 1 }), {
    enabled: path => path.pop().get()?.length > 1
      && !['minecraft:alternatives', 'minecraft:group', 'minecraft:sequence'].includes(path.push('type').get())
  }),
  [Switch]: path => path.push('type'),
  [Case]: {
    'minecraft:alternatives': {
      children: ListNode(
        Reference('loot_entry')
      ),
      ...functionsAndConditions
    },
    'minecraft:dynamic': {
      name: Force(StringNode()),
      ...functionsAndConditions
    },
    'minecraft:group': {
      children: ListNode(
        Reference('loot_entry')
      ),
      ...functionsAndConditions
    },
    'minecraft:item': {
      name: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
      ...functionsAndConditions
    },
    'minecraft:loot_table': {
      name: Force(StringNode({ validation: { validator: 'resource', params: { pool: '$loot_table' } } })),
      ...functionsAndConditions
    },
    'minecraft:sequence': {
      children: ListNode(
        Reference('loot_entry')
      ),
      ...functionsAndConditions
    },
    'minecraft:tag': {
      name: Force(StringNode({ validation: { validator: 'resource', params: { pool: '$tag/item' } } })),
      expand: BooleanNode(),
      ...functionsAndConditions
    }
  }
}, { context: 'loot_entry' }))

SCHEMAS.register('loot_function', ObjectNode({
  function: functionSwtichNode,
  [Switch]: path => path.push('function'),
  [Case]: {
    'minecraft:apply_bonus': {
      enchantment: Force(Resource(EnumNode('enchantment', { validation: { validator: 'resource', params: { pool: 'minecraft:enchantment' } } }))),
      formula: Resource(Resource(EnumNode('loot_table_apply_bonus_formula', { defaultValue: 'minecraft:uniform_bonus_count', validation: { validator: 'resource', params: { pool: COLLECTIONS.get('loot_table_apply_bonus_formula') } } }))),
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
          source: Force(StringNode({ validation: { validator: 'nbt_path', params: { category: { getter: 'copy_source', path: ['pop', 'pop', 'pop', { push: 'source' }] } } } })),
          target: Force(StringNode({ validation: { validator: 'nbt_path', params: { category: 'minecraft:item' } } })),
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
      levels: Force(Range({ allowBinomial: true })),
      treasure: BooleanNode(),
      ...conditions
    },
    'minecraft:exploration_map': {
      destination: Force(EnumNode('worldgen/structure_feature')),
      decoration: Force(Resource(EnumNode('map_decoration', { validation: { validator: 'resource', params: { pool: COLLECTIONS.get('map_decoration') } } }))),
      zoom: NumberNode({ integer: true }),
      search_radius: NumberNode({ integer: true }),
      skip_existing_chunks: BooleanNode(),
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
      limit: NumberNode({ integer: true }),
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
      count: Force(Range({ allowBinomial: true })),
      ...conditions
    },
    'minecraft:set_damage': {
      damage: Force(Range({ allowBinomial: true })),
      ...conditions
    },
    'minecraft:set_loot_table': {
      name: Force(StringNode({ validation: { validator: 'resource', params: { pool: '$loot_table' } } })),
      seed: NumberNode({ integer: true })
    },
    'minecraft:set_lore': {
      entity: Force(entitySourceSwtichNode),
      lore: Force(ListNode(
        Reference('text_component')
      )),
      replace: BooleanNode(),
      ...conditions
    },
    'minecraft:set_name': {
      entity: Force(entitySourceSwtichNode),
      name: Force(Reference('text_component')),
      ...conditions
    },
    'minecraft:set_nbt': {
      tag: Force(StringNode({ validation: { validator: 'nbt', params: { registry: { category: 'minecraft:item' } } } })),
      ...conditions
    },
    'minecraft:set_stew_effect': {
      effects: ListNode(
        ObjectNode({
          type: StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:mob_effect' } } }),
          duration: Range()
        })
      ),
      ...conditions
    }
  }
}, { category: 'function', context: 'function' }))

SCHEMAS.register('loot_condition', Mod(ObjectNode({
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

SCHEMAS.register('attribute_modifier', ObjectNode({
  attribute: Resource(EnumNode('attribute', { validation: { validator: 'resource', params: { pool: 'minecraft:attribute' } } })),
  name: StringNode(),
  amount: Range({ allowBinomial: true }),
  operation: EnumNode(['addition', 'multiply_base', 'multiply_total']),
  slot: StringOrList(
    EnumNode('slot')
  )
}, { context: 'attribute_modifier' }))
