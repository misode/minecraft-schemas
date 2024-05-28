import {
  BooleanNode,
  Case,
  StringNode as RawStringNode,
  ListNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  StringOrList,
  Switch,
  SwitchNode,
  INode,
  Path,
  ModelPath,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
  NodeChildren,
  ChoiceNode,
} from '@mcschema/core'
import {
  LootTableTypes,
  LootContext,
  LootFunctions,
  LootConditions,
  LootEntitySources,
  LootCopySources
} from '../LootContext'
import { ConditionCases, FunctionCases } from './Common'

export function initLootTableSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  const conditions: NodeChildren = {
    conditions: Opt(ListNode(
      Reference('loot_condition')
    ))
  }

  const functionsAndConditions: NodeChildren = {
    functions: Opt(ListNode(
      Reference('loot_function')
    )),
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

  const conditionIDSwtichNode = compileSwitchNode(LootConditions, 'loot_condition_type', type => StringNode({ validator: 'resource', params: { pool: type instanceof Array ? type : `loot_condition_type` } }))
  const functionIDSwtichNode = compileSwitchNode(LootFunctions, 'loot_function_type', type => StringNode({ validator: 'resource', params: { pool: type instanceof Array ? type : `loot_function_type` } }))
  const entitySourceSwtichNode = compileSwitchNode(LootEntitySources, 'entity_source', type => StringNode({ enum: type }))
  const copySourceSwtichNode = compileSwitchNode(LootCopySources, 'copy_source', type => StringNode({ enum: type}))

  schemas.register('loot_table', Mod(ObjectNode({
    type: Opt(StringNode({ validator: "resource", params: { pool: collections.get('loot_context_type') } })),
    pools: Opt(ListNode(
      Mod(ObjectNode({
        rolls: Reference('number_provider'),
        bonus_rolls: Opt(Reference('number_provider')),
        entries: ListNode(
          Reference('loot_entry')
        ),
        ...functionsAndConditions
      }, { category: 'pool', context: 'loot_pool' }), {
        default: () => ({
          rolls: 1,
          entries: [{
            type: 'minecraft:item',
            name: 'minecraft:stone'
          }]
        })
      })
    )),
    functions: Opt(ListNode(
      Reference('loot_function')
    )),
    random_sequence: Opt(StringNode({ validator: 'resource', params: { pool: [], allowUnknown: true } })),
  }, { context: 'loot_table' }), {
    default: () => ({
      pools: [{
        rolls: 1,
        entries: [{
          type: 'minecraft:item',
          name: 'minecraft:stone'
        }]
      }]
    })
  }))

  const singletonFields: NodeChildren = {
    weight: Opt(NumberNode({ integer: true })),
    quality: Opt(NumberNode({ integer: true })),
    ...functionsAndConditions,
  }

  schemas.register('loot_entry', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'loot_pool_entry_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:alternatives': {
        children: ListNode(
          Reference('loot_entry')
        ),
        ...conditions
      },
      'minecraft:dynamic': {
        name: StringNode(),
        ...singletonFields
      },
      'minecraft:empty': {
        ...singletonFields
      },
      'minecraft:group': {
        children: ListNode(
          Reference('loot_entry')
        ),
        ...conditions
      },
      'minecraft:item': {
        name: StringNode({ validator: 'resource', params: { pool: 'item' } }),
        ...singletonFields
      },
      'minecraft:loot_table': {
        value: ChoiceNode([
          {
            type: 'string',
            node: StringNode({ validator: 'resource', params: { pool: '$loot_table' } }),
            change: () => undefined
          },
          {
            type: 'object',
            node: Reference('loot_table'),
            change: () => ({ pools: [] })
          }
        ]),
        ...singletonFields
      },
      'minecraft:sequence': {
        children: ListNode(
          Reference('loot_entry')
        ),
        ...conditions
      },
      'minecraft:tag': {
        name: StringNode({ validator: 'resource', params: { pool: '$tag/item' } }),
        expand: BooleanNode(),
        ...singletonFields
      }
    }
  }, { context: 'loot_entry' }), {
    default: () => ({
      type: 'minecraft:item',
      name: 'minecraft:stone'
    })
  }))

  schemas.register('loot_function', Mod(ObjectNode({
    function: functionIDSwtichNode,
    [Switch]: [{ push: 'function' }],
    [Case]: FunctionCases(conditions, copySourceSwtichNode, entitySourceSwtichNode)
  }, { category: 'function', context: 'function' }), {
    default: () => ({
      function: 'minecraft:set_count',
      count: 1
    })
  }))

  schemas.register('loot_condition', Mod(ObjectNode({
    condition: conditionIDSwtichNode,
    [Switch]: [{ push: 'condition' }],
    [Case]: ConditionCases(entitySourceSwtichNode)
  }, { category: 'predicate', context: 'condition' }), {
    default: () => ({
      condition: 'minecraft:random_chance',
      chance: 0.5
    })
  }))

  schemas.register('attribute_modifier', Mod(ObjectNode({
    id: StringNode(),
    attribute: StringNode({ validator: 'resource', params: { pool: 'attribute' } }),
    amount: Reference('number_provider'),
    operation: StringNode({ enum: 'attribute_modifier_operation' }),
    slot: StringOrList(
      StringNode({ enum: 'equipment_slot_group' })
    )
  }, { context: 'attribute_modifier' }), {
    default: () => ({
      attribute: 'minecraft:generic.max_health',
      amount: 1,
      operation: 'addition',
      slot: 'mainhand'
    })
  }))
}
