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
  condition: Resource(Mod(EnumNode(COLLECTIONS.get('conditions')), {default: () => 'random_chance'})),
  [Switch]: path => path.push('condition').get(),
  [Case]: {
    'alternative': {
      terms: ListNode(
        Reference('condition')
      )
    },
    'block_state_property': {
      block: Resource(EnumNode(COLLECTIONS.get('blocks'))),
      properties: MapNode(
        StringNode(),
        StringNode()
      )
    },
    'damage_source_properties': {
      predicate: Reference('damage-source-predicate')
    },
    'entity_properties': {
      entity: Mod(EnumNode(COLLECTIONS.get('entity-sources')), {default: () => 'this'}),
      predicate: Reference('entity-predicate')
    },
    'entity_scores': {
      entity: Mod(EnumNode(COLLECTIONS.get('entity-sources')), {default: () => 'this'}),
      scores: MapNode(
        StringNode(),
        RangeNode()
      )
    },
    'inverted': {
      term: Reference('condition')
    },
    'killed_by_player': {
      inverse: BooleanNode()
    },
    'location_check': {
      offsetX: NumberNode({integer: true}),
      offsetY: NumberNode({integer: true}),
      offsetZ: NumberNode({integer: true}),
      predicate: Reference('location-predicate')
    },
    'match_tool': {
      predicate: Reference('item-predicate')
    },
    'random_chance': {
      chance: NumberNode({min: 0, max: 1})
    },
    'random_chance_with_looting': {
      chance: NumberNode({min: 0, max: 1}),
      looting_multiplier: NumberNode()
    },
    'requirements': {
      terms: ListNode(
        Reference('condition')
      ),
    },
    'reference': {
      name: StringNode()
    },
    'table_bonus': {
      enchantment: Resource(EnumNode(COLLECTIONS.get('enchantments'))),
      chances: ListNode(
        NumberNode({min: 0, max: 1})
      )
    },
    'time_check': {
      value: RangeNode(),
      period: NumberNode()
    },
    'weather_check': {
      raining: BooleanNode(),
      thrundering: BooleanNode()
    }
  }
}, { category: 'predicate' }), {
  default: () => ({
    condition: 'random_chance',
    chance: 0.5
  })
}))

export const ConditionSchema = SCHEMAS.get('condition')
