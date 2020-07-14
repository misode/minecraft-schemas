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
  Reference,
  Resource,
  SCHEMAS,
  StringNode,
  Switch,
} from '@mcschema/core'
import { Range } from './Common'

SCHEMAS.register('predicate', ObjectOrList(
  Reference('condition'), { choiceContext: 'condition' }
))

SCHEMAS.register('condition', ObjectNode({
  condition: Resource(EnumNode('loot_condition_type', { defaultValue: 'minecraft:random_chance', validation: { validator: 'resource', params: { pool: 'minecraft:loot_condition_type' } } })),
  [Switch]: path => path.push('condition'),
  [Case]: {
    'minecraft:alternative': {
      terms: Force(ListNode(
        Reference('condition')
      ))
    },
    'minecraft:block_state_property': {
      block: Resource(EnumNode('block', { validation: { validator: 'resource', params: { pool: 'minecraft:block' } } })),
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
      entity: EnumNode('entity_source', 'this'),
      predicate: Reference('entity_predicate')
    },
    'minecraft:entity_scores': {
      entity: EnumNode('entity_source', 'this'),
      scores: MapNode(
        StringNode({ validation: { validator: 'objective' } }),
        Range({ forceRange: true })
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
      name: Force(StringNode({ validation: { validator: 'resource', params: { pool: '$predicate' } } }))
    },
    'minecraft:table_bonus': {
      enchantment: Force(Resource(EnumNode('enchantment', { validation: { validator: 'resource', params: { pool: 'minecraft:enchantment' } } }))),
      chances: Force(ListNode(
        NumberNode({ min: 0, max: 1 })
      ))
    },
    'minecraft:time_check': {
      value: Force(Range()),
      period: NumberNode()
    },
    'minecraft:weather_check': {
      raining: BooleanNode(),
      thundering: BooleanNode()
    }
  }
}, { category: 'predicate', context: 'condition' }))
