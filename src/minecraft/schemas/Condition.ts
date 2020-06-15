import { Mod } from '../../nodes/Node';
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
import { SCHEMAS, COLLECTIONS } from '../../Registries';

import './Predicates'

SCHEMAS.register('condition', Mod(ObjectNode({
  condition: Resource(Mod(EnumNode('loot_condition_type'), {default: () => 'random_chance'})),
  [Switch]: path => path.push('condition').get(),
  [Case]: {
    'minecraft:alternative': {
      terms: ListNode(
        Reference('condition')
      )
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
      entity: Mod(EnumNode('entity_source'), {default: () => 'this'}),
      predicate: Reference('entity-predicate')
    },
    'minecraft:entity_scores': {
      entity: Mod(EnumNode('entity_source'), {default: () => 'this'}),
      scores: MapNode(
        StringNode(),
        RangeNode()
      )
    },
    'minecraft:inverted': {
      term: Reference('condition')
    },
    'minecraft:killed_by_player': {
      inverse: BooleanNode()
    },
    'minecraft:location_check': {
      offsetX: NumberNode({integer: true}),
      offsetY: NumberNode({integer: true}),
      offsetZ: NumberNode({integer: true}),
      predicate: Reference('location-predicate')
    },
    'minecraft:match_tool': {
      predicate: Reference('item-predicate')
    },
    'minecraft:random_chance': {
      chance: NumberNode({min: 0, max: 1})
    },
    'minecraft:random_chance_with_looting': {
      chance: NumberNode({min: 0, max: 1}),
      looting_multiplier: NumberNode()
    },
    'minecraft:requirements': {
      terms: ListNode(
        Reference('condition')
      ),
    },
    'minecraft:reference': {
      name: StringNode()
    },
    'minecraft:table_bonus': {
      enchantment: Resource(EnumNode('enchantment')),
      chances: ListNode(
        NumberNode({min: 0, max: 1})
      )
    },
    'minecraft:time_check': {
      value: RangeNode(),
      period: NumberNode()
    },
    'minecraft:weather_check': {
      raining: BooleanNode(),
      thrundering: BooleanNode()
    }
  }
}, { category: 'predicate' }), {
  default: () => ({
    condition: 'minecraft:random_chance',
    chance: 0.5
  })
}))

export const ConditionSchema = SCHEMAS.get('condition')
