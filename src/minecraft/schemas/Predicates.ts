import { ObjectNode } from '../../nodes/ObjectNode';
import { Resource } from '../nodes/Resource';
import { EnumNode } from '../../nodes/EnumNode';
import { ListNode } from '../../nodes/ListNode';
import { RangeNode } from '../nodes/RangeNode';
import { StringNode } from '../../nodes/StringNode';
import { Reference } from '../../nodes/Reference';
import { BooleanNode } from '../../nodes/BooleanNode';
import { MapNode } from '../../nodes/MapNode';
import { SCHEMAS, COLLECTIONS } from '../../Registries';

import './Collections'

SCHEMAS.register('item-predicate', ObjectNode({
  item: Resource(EnumNode(COLLECTIONS.get('items'))),
  tag: StringNode(),
  count: RangeNode(),
  durability: RangeNode(),
  potion: StringNode(),
  nbt: StringNode(),
  enchantments: ListNode(
    Reference('enchantment-predicate')
  )
}))

SCHEMAS.register('enchantment-predicate', ObjectNode({
  enchantment: Resource(EnumNode(COLLECTIONS.get('enchantments'))),
  levels: RangeNode()
}))

SCHEMAS.register('block-predicate', ObjectNode({
  block: Resource(EnumNode(COLLECTIONS.get('blocks'))),
  tag: StringNode(),
  nbt: StringNode(),
  state: MapNode(
    StringNode(),
    StringNode()
  )
}))

SCHEMAS.register('fluid-predicate', ObjectNode({
  fluid: Resource(EnumNode(COLLECTIONS.get('fluids'))),
  tag: StringNode(),
  nbt: StringNode(),
  state: MapNode(
    StringNode(),
    StringNode()
  )
}))

SCHEMAS.register('location-predicate', ObjectNode({
  position: ObjectNode({
    x: RangeNode(),
    y: RangeNode(),
    z: RangeNode()
  }, {collapse: true}),
  biome: Resource(EnumNode(COLLECTIONS.get('biomes'))),
  feature: EnumNode(COLLECTIONS.get('structures')),
  dimension: Resource(StringNode()),
  light: ObjectNode({
    light: RangeNode()
  }),
  smokey: BooleanNode(),
  block: Reference('block-predicate', {collapse: true}),
  fluid: Reference('fluid-predicate', {collapse: true})
}))

SCHEMAS.register('statistic-predicate', ObjectNode({
  type: EnumNode(COLLECTIONS.get('statistic-types')),
  stat: StringNode(),
  value: RangeNode()
}))

SCHEMAS.register('player-predicate', ObjectNode({
  gamemode: EnumNode(COLLECTIONS.get('gamemodes')),
  level: RangeNode(),
  advancements: MapNode(
    StringNode(),
    BooleanNode()
  ),
  recipes: MapNode(
    StringNode(),
    BooleanNode()
  ),
  stats: ListNode(
    Reference('statistic-predicate')
  )
}))

SCHEMAS.register('status-effect-predicate', ObjectNode({
  amplifier: RangeNode(),
  duration: RangeNode(),
  ambient: BooleanNode(),
  visible: BooleanNode()
}))

SCHEMAS.register('distance-predicate', ObjectNode({
  x: RangeNode(),
  y: RangeNode(),
  z: RangeNode(),
  absolute: RangeNode(),
  horizontal: RangeNode()
}))

SCHEMAS.register('entity-predicate', ObjectNode({
  type: StringNode(),
  nbt: StringNode(),
  team: StringNode(),
  location: Reference('location-predicate', {collapse: true}),
  distance: Reference('distance-predicate', {collapse: true}),
  flags: ObjectNode({
    is_on_fire: BooleanNode(),
    is_sneaking: BooleanNode(),
    is_sprinting: BooleanNode(),
    is_swimming: BooleanNode(),
    is_baby: BooleanNode()
  }, {collapse: true}),
  equipment: MapNode(
    EnumNode(COLLECTIONS.get('slots')),
    Reference('item-predicate')
  ),
  vehicle: Reference('entity-predicate', {collapse: true}),
  targeted_entity: Reference('entity-predicate', {collapse: true}),
  player: Reference('player-predicate', {collapse: true}),
  fishing_hook: ObjectNode({
    in_open_water: BooleanNode()
  }),
  effects: MapNode(
    Resource(EnumNode(COLLECTIONS.get('status-effects'))),
    Reference('status-effect-predicate')
  )
}))
