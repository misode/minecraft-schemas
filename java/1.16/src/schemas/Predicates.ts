import {
  BooleanNode,
  EnumNode,
  Force,
  ListNode,
  MapNode,
  ObjectNode,
  RangeNode,
  Reference,
  Resource,
  SCHEMAS,
  StringNode,
} from '@mcschema/core'

SCHEMAS.register('item_predicate', ObjectNode({
  item: Resource(EnumNode('item', { search: true })),
  tag: StringNode(),
  count: RangeNode(),
  durability: RangeNode(),
  potion: StringNode(),
  nbt: StringNode(),
  enchantments: ListNode(
    Reference('enchantment_predicate')
  )
}, { context: 'item' }))

SCHEMAS.register('enchantment_predicate', ObjectNode({
  enchantment: Resource(EnumNode('enchantment', { search: true })),
  levels: RangeNode()
}, { context: 'enchantment' }))

SCHEMAS.register('block_predicate', ObjectNode({
  block: Resource(EnumNode('block', { search: true })),
  tag: StringNode(),
  nbt: StringNode(),
  state: MapNode(
    StringNode(),
    StringNode()
  )
}, { context: 'block' }))

SCHEMAS.register('fluid_predicate', ObjectNode({
  fluid: Resource(EnumNode('fluid', { search: true })),
  tag: StringNode(),
  nbt: StringNode(),
  state: MapNode(
    StringNode(),
    StringNode()
  )
}, { context: 'fluid' }))

SCHEMAS.register('location_predicate', ObjectNode({
  position: ObjectNode({
    x: RangeNode(),
    y: RangeNode(),
    z: RangeNode()
  }, { collapse: true }),
  biome: Resource(EnumNode('biome', { search: true })),
  feature: Resource(EnumNode('structure_feature', { search: true })),
  dimension: Resource(EnumNode('dimension', { search: true, additional: true })),
  light: ObjectNode({
    light: RangeNode()
  }),
  smokey: BooleanNode(),
  block: Reference('block_predicate', { collapse: true }),
  fluid: Reference('fluid_predicate', { collapse: true })
}, { context: 'location' }))

SCHEMAS.register('statistic_predicate', ObjectNode({
  type: EnumNode('stat_type', 'minecraft:custom'),
  stat: Force(StringNode()),
  value: Force(RangeNode())
}))

SCHEMAS.register('player_predicate', ObjectNode({
  gamemode: EnumNode('gamemode'),
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
    Reference('statistic_predicate')
  )
}, { context: 'player' }))

SCHEMAS.register('status_effect_predicate', ObjectNode({
  amplifier: RangeNode(),
  duration: RangeNode(),
  ambient: BooleanNode(),
  visible: BooleanNode()
}, { context: 'status_effect' }))

SCHEMAS.register('distance_predicate', ObjectNode({
  x: RangeNode(),
  y: RangeNode(),
  z: RangeNode(),
  absolute: RangeNode(),
  horizontal: RangeNode()
}, { context: 'distance' }))

SCHEMAS.register('entity_predicate', ObjectNode({
  type: StringNode(),
  nbt: StringNode(),
  team: StringNode(),
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
    Resource(EnumNode('mob_effect', { search: true })),
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
  dealt: RangeNode(),
  taken: RangeNode(),
  blocked: BooleanNode(),
  source_entity: Reference('entity_predicate', { collapse: true }),
  type: Reference('damage_source_predicate', { collapse: true })
}, { context: 'damage' }))
