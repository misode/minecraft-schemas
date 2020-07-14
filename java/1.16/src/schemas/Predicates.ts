import {
  BooleanNode,
  EnumNode,
  Force,
  ListNode,
  MapNode,
  ObjectNode,
  Reference,
  Resource,
  SCHEMAS,
  StringNode,
  Switch,
  Case,
} from '@mcschema/core'
import { Range } from './Common'

SCHEMAS.register('item_predicate', ObjectNode({
  item: Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } })),
  tag: StringNode({ validation: { validator: 'resource', params: { pool: '$tag/item' } } }),
  count: Range(),
  durability: Range(),
  potion: StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:potion' } } }),
  nbt: StringNode({ validation: { validator: 'nbt', params: { registry: { category: 'minecraft:item', id: ['pop', { push: 'item' }] } } } }),
  enchantments: ListNode(
    Reference('enchantment_predicate')
  )
}, { context: 'item' }))

SCHEMAS.register('enchantment_predicate', ObjectNode({
  enchantment: Resource(EnumNode('enchantment', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:enchantment' } } })),
  levels: Range()
}, { context: 'enchantment' }))

SCHEMAS.register('block_predicate', ObjectNode({
  block: Resource(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } })),
  tag: StringNode({ validation: { validator: 'resource', params: { pool: '$tag/block' } } }),
  nbt: StringNode({ validation: { validator: 'nbt', params: { registry: { category: 'minecraft:block', id: ['pop', { push: 'block' }] } } } }),
  state: MapNode(
    StringNode(),
    StringNode(),
    { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'block' }] } } }
  )
}, { context: 'block' }))

SCHEMAS.register('fluid_predicate', ObjectNode({
  fluid: Resource(EnumNode('fluid', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:fluid' } } })),
  tag: StringNode({ validation: { validator: 'resource', params: { pool: '$tag/fluid' } } }),
  state: MapNode(
    StringNode(),
    StringNode()
  )
}, { context: 'fluid' }))

SCHEMAS.register('location_predicate', ObjectNode({
  position: ObjectNode({
    x: Range(),
    y: Range(),
    z: Range()
  }, { collapse: true }),
  biome: Resource(EnumNode('biome', { search: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } })),
  feature: Resource(EnumNode('structure_feature', { search: true })),
  dimension: Resource(EnumNode('dimension', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$dimension' } } })),
  light: ObjectNode({
    light: Range()
  }),
  smokey: BooleanNode(),
  block: Reference('block_predicate', { collapse: true }),
  fluid: Reference('fluid_predicate', { collapse: true })
}, { context: 'location' }))

SCHEMAS.register('statistic_predicate', ObjectNode({
  type: EnumNode('stat_type', { defaultValue: 'minecraft:custom', validation: { validator: 'resource', params: { pool: 'minecraft:stat_type' } } }),
  stat: Force(StringNode()),
  value: Force(Range()),
  [Switch]: path => path.push('type'),
  [Case]: {
    'minecraft:mined': {
      stat: Force(StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:block' } } }))
    },
    'minecraft:crafted': {
      stat: Force(StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))
    },
    'minecraft:used': {
      stat: Force(StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))
    },
    'minecraft:broken': {
      stat: Force(StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))
    },
    'minecraft:picked_up': {
      stat: Force(StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))
    },
    'minecraft:dropped': {
      stat: Force(StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))
    },
    'minecraft:killed': {
      stat: Force(StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:entity_type' } } }))
    },
    'minecraft:killed_by': {
      stat: Force(StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:entity_type' } } }))
    },
    'minecraft:custom': {
      stat: Force(StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:custom_stat' } } }))
    }
  }
}))

SCHEMAS.register('player_predicate', ObjectNode({
  gamemode: EnumNode('gamemode'),
  level: Range(),
  advancements: MapNode(
    StringNode({ validation: { validator: 'resource', params: { pool: '$advancement' } } }),
    BooleanNode()
  ),
  recipes: MapNode(
    StringNode({ validation: { validator: 'resource', params: { pool: '$recipe' } } }),
    BooleanNode()
  ),
  stats: ListNode(
    Reference('statistic_predicate')
  )
}, { context: 'player' }))

SCHEMAS.register('status_effect_predicate', ObjectNode({
  amplifier: Range(),
  duration: Range(),
  ambient: BooleanNode(),
  visible: BooleanNode()
}, { context: 'status_effect' }))

SCHEMAS.register('distance_predicate', ObjectNode({
  x: Range(),
  y: Range(),
  z: Range(),
  absolute: Range(),
  horizontal: Range()
}, { context: 'distance' }))

SCHEMAS.register('entity_predicate', ObjectNode({
  type: StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:entity_type', allowTag: true } } }),
  nbt: StringNode({ validation: { validator: 'nbt', params: { registry: { category: 'minecraft:entity', id: ['pop', { push: 'type' }] } } } }),
  team: StringNode({ validation: { validator: 'team' } }),
  location: Reference('location_predicate', { collapse: true }),
  distance: Reference('distance_predicate', { collapse: true }),
  flags: ObjectNode({
    is_on_fire: BooleanNode(),
    is_sneaking: BooleanNode(),
    is_sprinting: BooleanNode(),
    is_swimming: BooleanNode(),
    is_baby: BooleanNode()
  }, { collapse: true }),
  equipment: MapNode(
    EnumNode('slot', 'mainhand'),
    Reference('item_predicate')
  ),
  vehicle: Reference('entity_predicate', { collapse: true }),
  targeted_entity: Reference('entity_predicate', { collapse: true }),
  player: Reference('player_predicate', { collapse: true }),
  fishing_hook: ObjectNode({
    in_open_water: BooleanNode()
  }),
  effects: MapNode(
    Resource(EnumNode('mob_effect', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:mob_effect' } } })),
    Reference('status_effect_predicate')
  )
}, { context: 'entity' }))

SCHEMAS.register('damage_source_predicate', ObjectNode({
  is_explosion: BooleanNode(),
  is_fire: BooleanNode(),
  is_magic: BooleanNode(),
  is_projectile: BooleanNode(),
  is_lightning: BooleanNode(),
  bypasses_armor: BooleanNode(),
  bypasses_invulnerability: BooleanNode(),
  bypasses_magic: BooleanNode(),
  source_entity: Reference('entity_predicate', { collapse: true }),
  direct_entity: Reference('entity_predicate', { collapse: true })
}, { context: 'damage_source' }))

SCHEMAS.register('damage_predicate', ObjectNode({
  dealt: Range(),
  taken: Range(),
  blocked: BooleanNode(),
  source_entity: Reference('entity_predicate', { collapse: true }),
  type: Reference('damage_source_predicate', { collapse: true })
}, { context: 'damage' }))
