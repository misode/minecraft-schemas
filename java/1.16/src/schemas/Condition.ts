import {
  BooleanNode,
  Case,
  EnumNode,
  Force,
  ListNode,
  MapNode,
  NumberNode,
  ObjectNode,
  ObjectOrList,
  RangeNode,
  Reference,
  Resource,
  SCHEMAS,
  StringNode,
  Switch,
} from '@mcschema/core'

SCHEMAS.register('predicate', ObjectOrList(
  Reference('condition'), { context: 'condition' }
))

SCHEMAS.register('condition', ObjectNode({
  condition: Resource(EnumNode('loot_condition_type', 'minecraft:random_chance')),
  [Switch]: path => path.push('condition'),
  [Case]: {
    'minecraft:alternative': {
      terms: Force(ListNode(
        Reference('condition')
      ))
    },
    'minecraft:block_state_property': {
      block: Resource(EnumNode('block')),
      properties: MapNode(
        StringNode(),
        StringNode()
      )
    },
    'minecraft:damage_source_properties': {
      predicate: Reference('damage_source_predicate')
    },
    'minecraft:entity_properties': {
      entity: EnumNode('entity_source', 'this'),
      predicate: Reference('entity_predicate')
    },
    'minecraft:entity_scores': {
      entity: EnumNode('entity_source', 'this'),
      scores: MapNode(
        StringNode(),
        RangeNode({ forceRange: true })
      )
    },
    'minecraft:inverted': {
      term: Force(Reference('condition'))
    },
    'minecraft:killed_by_player': {
      inverse: BooleanNode()
    },
    'minecraft:location_check': {
      offsetX: NumberNode({ integer: true }),
      offsetY: NumberNode({ integer: true }),
      offsetZ: NumberNode({ integer: true }),
      predicate: Reference('location_predicate')
    },
    'minecraft:match_tool': {
      predicate: Reference('item_predicate')
    },
    'minecraft:random_chance': {
      chance: Force(NumberNode({ min: 0, max: 1 }))
    },
    'minecraft:random_chance_with_looting': {
      chance: NumberNode({ min: 0, max: 1 }),
      looting_multiplier: NumberNode()
    },
    'minecraft:requirements': {
      terms: ListNode(
        Reference('condition')
      ),
    },
    'minecraft:reference': {
      name: Force(StringNode())
    },
    'minecraft:table_bonus': {
      enchantment: Force(Resource(EnumNode('enchantment'))),
      chances: Force(ListNode(
        NumberNode({ min: 0, max: 1 })
      ))
    },
    'minecraft:time_check': {
      value: Force(RangeNode()),
      period: NumberNode()
    },
    'minecraft:weather_check': {
      raining: BooleanNode(),
      thundering: BooleanNode()
    }
  }
}, { category: 'predicate', context: 'condition' }))
