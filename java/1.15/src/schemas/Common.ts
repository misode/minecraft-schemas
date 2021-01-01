import {
  StringNode as RawStringNode,
  ObjectNode,
  MapNode,
  ListNode,
  NumberNode,
  ChoiceNode,
  Reference as RawReference,
  INode,
  SchemaRegistry,
  CollectionRegistry,
  NestedNodeChildren,
  BooleanNode,
  Opt,
  Mod,
} from '@mcschema/core'

export let ConditionCases: NestedNodeChildren

type RangeConfig = {
  /** Whether only integers are allowed */
  integer?: boolean
  /** If specified, number will be capped at this minimum */
  min?: number
  /** If specified, number will be capped at this maximum */
  max?: number
  /** Whether binomials are allowed */
  allowBinomial?: boolean
  /** If true, only ranges are allowed */
  forceRange?: boolean
  /** If true, min and max are both required */
  bounds?: boolean
}
export let Range: (config?: RangeConfig) => INode

export function initCommonSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)
  const Reference = RawReference.bind(undefined, schemas)

  schemas.register('block_state', Mod(ObjectNode({
    Name: StringNode({ validator: 'resource', params: { pool: 'block' } }),
    Properties: Opt(MapNode(
      StringNode(),
      StringNode(),
      { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'Name' }] } } }
    ))
  }, { context: 'block_state' }), {
    default: () => ({  
      Name: 'minecraft:stone'
    })
  }))

  schemas.register('fluid_state', Mod(ObjectNode({
    Name: StringNode({ validator: 'resource', params: { pool: 'fluid' } }),
    Properties: Opt(MapNode(
      StringNode(),
      StringNode()
    ))
  }, { context: 'fluid_state' }), {
    default: () => ({
      Name: 'minecraft:water',
      Properties: {
        'level': '0'
      }
    })
  }))

  schemas.register('block_pos', Mod(ListNode(
    NumberNode({ integer: true })
  ), {
    default: () => [0, 0, 0]
  }))

  Range = (config?: RangeConfig) => ChoiceNode([
    ...(config?.forceRange ? [] : [{
      type: 'number',
      node: NumberNode(config),
      change: (v: any) => v === undefined ? 0 : v.min ?? v.max ?? v.n ?? 0
    }]),
    {
      type: 'object',
      priority: -1,
      node: ObjectNode({
        min: config?.bounds ? NumberNode(config) : Opt(NumberNode(config)),
        max: config?.bounds ? NumberNode(config) : Opt(NumberNode(config))
      }, { context: 'range' }),
      change: (v: any) => ({
        min: typeof v === 'number' ? v : v === undefined ? 1 : v.n,
        max: typeof v === 'number' ? v : v === undefined ? 1 : v.n
      })
    },
    ...(config?.allowBinomial ? [{
      type: 'binomial',
      node: ObjectNode({
        type: StringNode({enum: ['minecraft:binomial'] }),
        n: NumberNode({ integer: true, min: 0 }),
        p: NumberNode({ min: 0, max: 1 })
      }, { context: 'range' }),
      match: (v: any) => v !== undefined && v.type === 'minecraft:binomial',
      change: (v: any) => ({
        type: 'minecraft:binomial',
        n: typeof v === 'number' ? v : v === undefined ? 1 : (v.min ?? v.max ?? 1),
        p: 0.5
      })
    }] : [])
  ], { choiceContext: 'range' })

  ConditionCases = {
    'minecraft:alternative': {
      terms: ListNode(
        Reference('condition')
      )
    },
    'minecraft:block_state_property': {
      block: StringNode({ validator: 'resource', params: { pool: 'block' } }),
      properties: MapNode(
        StringNode(),
        StringNode(),
        { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'block' }] } } }
      )
    },
    'minecraft:damage_source_properties': {
      predicate: Reference('damage_source_predicate')
    },
    'minecraft:entity_properties': {
      entity: StringNode({ enum: 'entity_source' }),
      predicate: Reference('entity_predicate')
    },
    'minecraft:entity_scores': {
      entity: StringNode({ enum: 'entity_source' }),
      scores: MapNode(
        StringNode({ validator: 'objective' }),
        Range({ forceRange: true, bounds: true })
      )
    },
    'minecraft:inverted': {
      term: Reference('condition')
    },
    'minecraft:killed_by_player': {
      inverse: Opt(BooleanNode())
    },
    'minecraft:location_check': {
      offsetX: Opt(NumberNode({ integer: true })),
      offsetY: Opt(NumberNode({ integer: true })),
      offsetZ: Opt(NumberNode({ integer: true })),
      predicate: Reference('location_predicate')
    },
    'minecraft:match_tool': {
      predicate: Reference('item_predicate')
    },
    'minecraft:random_chance': {
      chance: NumberNode({ min: 0, max: 1 })
    },
    'minecraft:random_chance_with_looting': {
      chance: NumberNode({ min: 0, max: 1 }),
      looting_multiplier: NumberNode()
    },
    'minecraft:reference': {
      name: StringNode({ validator: 'resource', params: { pool: '$predicate' } })
    },
    'minecraft:table_bonus': {
      enchantment: StringNode({ validator: 'resource', params: { pool: 'enchantment' } }),
      chances: ListNode(
        NumberNode({ min: 0, max: 1 })
      )
    },
    'minecraft:time_check': {
      value: Range(),
      period: Opt(NumberNode())
    },
    'minecraft:weather_check': {
      raining: Opt(BooleanNode()),
      thundering: Opt(BooleanNode())
    }
  }
}
