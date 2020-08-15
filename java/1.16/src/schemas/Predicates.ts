import {
  BooleanNode,
  EnumNode as RawEnumNode,
  Force,
  ListNode,
  MapNode,
  ObjectNode,
  Opt,
  Reference as RawReference,
  Resource,
  StringNode,
  Switch,
  Case,
  SchemaRegistry,
  CollectionRegistry,
} from '@mcschema/core'
import { Range } from './Common'

export function initPredicatesSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('item_predicate', ObjectNode({
    item: Opt(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
    tag: Opt(StringNode({ validation: { validator: 'resource', params: { pool: '$tag/item' } } })),
    count: Opt(Range()),
    durability: Opt(Range()),
    potion: Opt(StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:potion' } } })),
    nbt: Opt(StringNode({ validation: { validator: 'nbt', params: { registry: { category: 'minecraft:item', id: ['pop', { push: 'item' }] } } } })),
    enchantments: Opt(ListNode(
      Reference('enchantment_predicate')
    ))
  }, { context: 'item' }))

  schemas.register('enchantment_predicate', ObjectNode({
    enchantment: Opt(Resource(EnumNode('enchantment', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:enchantment' } } }))),
    levels: Opt(Range())
  }, { context: 'enchantment' }))

  schemas.register('block_predicate', ObjectNode({
    block: Opt(Resource(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } }))),
    tag: Opt(StringNode({ validation: { validator: 'resource', params: { pool: '$tag/block' } } })),
    nbt: Opt(StringNode({ validation: { validator: 'nbt', params: { registry: { category: 'minecraft:block', id: ['pop', { push: 'block' }] } } } })),
    state: Opt(MapNode(
      StringNode(),
      StringNode(),
      { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'block' }] } } }
    ))
  }, { context: 'block' }))

  schemas.register('fluid_predicate', ObjectNode({
    fluid: Opt(Resource(EnumNode('fluid', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:fluid' } } }))),
    tag: Opt(StringNode({ validation: { validator: 'resource', params: { pool: '$tag/fluid' } } })),
    state: Opt(MapNode(
      StringNode(),
      StringNode()
    ))
  }, { context: 'fluid' }))

  schemas.register('location_predicate', ObjectNode({
    position: Opt(ObjectNode({
      x: Opt(Range()),
      y: Opt(Range()),
      z: Opt(Range())
    })),
    biome: Opt(Resource(EnumNode('worldgen/biome', { search: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } }))),
    feature: Opt(EnumNode(collections.get('worldgen/structure_feature').map(v => v.slice(10)), { search: true })),
    dimension: Opt(Resource(EnumNode('dimension', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$dimension' } } }))),
    light: Opt(ObjectNode({
      light: Opt(Range({ integer: true, min: 0, max: 15 }))
    })),
    smokey: Opt(BooleanNode()),
    block: Opt(Reference('block_predicate')),
    fluid: Opt(Reference('fluid_predicate'))
  }, { context: 'location' }))

  schemas.register('statistic_predicate', ObjectNode({
    type: Resource(EnumNode('stat_type', { defaultValue: 'minecraft:custom', validation: { validator: 'resource', params: { pool: 'minecraft:stat_type' } } })),
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

  schemas.register('player_predicate', ObjectNode({
    gamemode: Opt(EnumNode('gamemode')),
    level: Opt(Range()),
    advancements: Opt(MapNode(
      StringNode({ validation: { validator: 'resource', params: { pool: '$advancement' } } }),
      BooleanNode()
    )),
    recipes: Opt(MapNode(
      StringNode({ validation: { validator: 'resource', params: { pool: '$recipe' } } }),
      BooleanNode()
    )),
    stats: Opt(ListNode(
      Reference('statistic_predicate')
    ))
  }, { context: 'player' }))

  schemas.register('status_effect_predicate', ObjectNode({
    amplifier: Opt(Range()),
    duration: Opt(Range()),
    ambient: Opt(BooleanNode()),
    visible: Opt(BooleanNode())
  }, { context: 'status_effect' }))

  schemas.register('distance_predicate', ObjectNode({
    x: Opt(Range()),
    y: Opt(Range()),
    z: Opt(Range()),
    absolute: Opt(Range()),
    horizontal: Opt(Range())
  }, { context: 'distance' }))

  schemas.register('entity_predicate', ObjectNode({
    type: Opt(StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:entity_type', allowTag: true } } })),
    nbt: Opt(StringNode({ validation: { validator: 'nbt', params: { registry: { category: 'minecraft:entity', id: ['pop', { push: 'type' }] } } } })),
    team: Opt(StringNode({ validation: { validator: 'team' } })),
    location: Opt(Reference('location_predicate')),
    distance: Opt(Reference('distance_predicate')),
    flags: Opt(ObjectNode({
      is_on_fire: Opt(BooleanNode()),
      is_sneaking: Opt(BooleanNode()),
      is_sprinting: Opt(BooleanNode()),
      is_swimming: Opt(BooleanNode()),
      is_baby: Opt(BooleanNode())
    })),
    equipment: Opt(MapNode(
      EnumNode('slot', 'mainhand'),
      Reference('item_predicate')
    )),
    vehicle: Opt(Reference('entity_predicate')),
    targeted_entity: Opt(Reference('entity_predicate')),
    player: Opt(Reference('player_predicate')),
    fishing_hook: Opt(ObjectNode({
      in_open_water: Opt(BooleanNode())
    })),
    effects: Opt(MapNode(
      Resource(EnumNode('mob_effect', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:mob_effect' } } })),
      Reference('status_effect_predicate')
    ))
  }, { context: 'entity' }))

  schemas.register('damage_source_predicate', ObjectNode({
    is_explosion: Opt(BooleanNode()),
    is_fire: Opt(BooleanNode()),
    is_magic: Opt(BooleanNode()),
    is_projectile: Opt(BooleanNode()),
    is_lightning: Opt(BooleanNode()),
    bypasses_armor: Opt(BooleanNode()),
    bypasses_invulnerability: Opt(BooleanNode()),
    bypasses_magic: Opt(BooleanNode()),
    source_entity: Opt(Reference('entity_predicate')),
    direct_entity: Opt(Reference('entity_predicate'))
  }, { context: 'damage_source' }))

  schemas.register('damage_predicate', ObjectNode({
    dealt: Opt(Range()),
    taken: Opt(Range()),
    blocked: Opt(BooleanNode()),
    source_entity: Opt(Reference('entity_predicate')),
    type: Opt(Reference('damage_source_predicate'))
  }, { context: 'damage' }))
}
