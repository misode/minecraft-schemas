import { Force } from '../../nodes/Node';
import { EnumNode } from '../../nodes/EnumNode';
import { Resource } from '../nodes/Resource';
import { NumberNode } from '../../nodes/NumberNode';
import { BooleanNode } from '../../nodes/BooleanNode';
import { ObjectNode, Switch, Case } from '../../nodes/ObjectNode';
import { ListNode } from '../../nodes/ListNode';
import { RangeNode } from '../nodes/RangeNode';
import { MapNode } from '../../nodes/MapNode';
import { StringNode } from '../../nodes/StringNode';
import { Reference } from '../../nodes/Reference';
import { ObjectOrList } from '../../nodes/ChoiceNode';
import { SCHEMAS } from '../../Registries';

import './Predicates'

SCHEMAS.register('predicate', ObjectOrList(
  Reference('condition')
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
      predicate: Reference('damage-source-predicate')
    },
    'minecraft:entity_properties': {
      entity: EnumNode('entity_source', 'this'),
      predicate: Reference('entity-predicate')
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
      predicate: Reference('location-predicate')
    },
    'minecraft:match_tool': {
      predicate: Reference('item-predicate')
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
      thrundering: BooleanNode()
    }
  }
}, { category: 'predicate' }))

export const ConditionSchema = SCHEMAS.get('predicate')
