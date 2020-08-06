import {
  BooleanNode,
  EnumNode as RawEnumNode,
  Force,
  ListNode,
  MapNode,
  Mod,
  NumberNode,
  ObjectNode,
  Resource,
  StringNode,
  SchemaRegistry,
  CollectionRegistry,
} from '@mcschema/core'

export function initBiomeSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('biome', Mod(ObjectNode({
    surface_builder: Force(Resource(EnumNode('worldgen/surface_builder', { search: true, additional: true }))),
    depth: NumberNode(),
    scale: NumberNode(),
    temperature: NumberNode(),
    downfall: NumberNode(),
    precipitation: EnumNode(['none', 'rain', 'snow'], 'none'),
    category: EnumNode('biome_category'),
    player_spawn_friendly: Force(BooleanNode({ radio: true })),
    effects: Force(ObjectNode({
      sky_color: NumberNode({ color: true }),
      fog_color: NumberNode({ color: true }),
      water_color: NumberNode({ color: true }),
      water_fog_color: NumberNode({ color: true }),
      ambient_sound: StringNode(),
      mood_sound: ObjectNode({
        sound: StringNode(),
        tick_delay: NumberNode({ integer: true }),
        block_search_extent: NumberNode({ integer: true }),
        offset: NumberNode()
      }, { collapse: true }),
      additions_sound: ObjectNode({
        sound: StringNode(),
        tick_chance: NumberNode({ min: 0, max: 1 })
      }, { collapse: true }),
      music: ObjectNode({
        sound: StringNode(),
        min_delay: NumberNode({ integer: true, min: 0 }),
        max_delay: NumberNode({ integer: true, min: 0 }),
        replace_current_music: BooleanNode()
      }, { collapse: true }),
      particle: ObjectNode({
        options: ObjectNode({
          type: StringNode()
        }),
        probability: NumberNode({ min: 0, max: 1 })
      }, { collapse: true })
    })),
    starts: Force(ListNode(
      EnumNode('configured_structure_feature', { search: true, additional: true })
    )),
    spawners: Force(MapNode(
      EnumNode([
        'water_ambient',
        'ambient',
        'misc',
        'water_creature',
        'creature',
        'monster'
      ], 'creature'),
      Mod(ListNode(
        ObjectNode({
          type: EnumNode('entity_type'),
          weight: NumberNode({ integer: true }),
          minCount: NumberNode({ integer: true }),
          maxCount: NumberNode({ integer: true })
        })
      ), {
        default: () => [{
          type: 'minecraft:bat',
          weight: 1
        }]
      })
    )),
    spawn_costs: Force(MapNode(
      EnumNode('entity_type', { search: true }),
      Mod(ObjectNode({
        energy_budget: Force(NumberNode()),
        charge: Force(NumberNode())
      }), {
        default: () => ({
          energy_budget: 0.12,
          charge: 1.0
        })
      })
    )),
    carvers: Force(MapNode(
      EnumNode(['air', 'liquid'], 'air'),
      Mod(ListNode(
        EnumNode('worldgen/carver', { search: true, additional: true })
      ), {
        default: () => ['minecraft:cave']
      })
    )),
    features: Force(ListNode(
      ListNode(
        EnumNode('configured_feature', { search: true, additional: true })
      )
    ))
  }, { context: 'biome' }), {
    default: () => ({
      surface_builder: 'minecraft:default',
      depth: 0.125,
      scale: 0.05,
      temperature: 0.8,
      downfall: 0.4,
      player_spawn_friendly: false,
      effects: {
        sky_color: 7907327,
        fog_color: 12638463,
        water_color: 4159204,
        water_fog_color: 329011
      }
    })
  }))
}
