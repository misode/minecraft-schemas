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
  Opt,
} from '@mcschema/core'

export function initBiomeSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('biome', Mod(ObjectNode({
    surface_builder: Force(Resource(EnumNode('worldgen/surface_builder', { search: true, additional: true }))),
    depth: NumberNode(),
    scale: NumberNode(),
    temperature: NumberNode(),
    downfall: NumberNode(),
    precipitation: Force(EnumNode(['none', 'rain', 'snow'], 'none')),
    temperature_modifier: Opt(EnumNode(['none', 'frozen'])),
    category: Force(EnumNode('biome_category', 'plains')),
    player_spawn_friendly: Opt(BooleanNode()),
    creature_spawn_probability: Opt(NumberNode({ min: 0, max: 1 })),
    effects: Force(ObjectNode({
      sky_color: Force(NumberNode({ color: true })),
      fog_color: Force(NumberNode({ color: true })),
      water_color: Force(NumberNode({ color: true })),
      water_fog_color: Force(NumberNode({ color: true })),
      grass_color: Opt(NumberNode({ color: true })),
      foliage_color: Opt(NumberNode({ color: true })),
      grass_color_modifier: Opt(EnumNode(['none', 'dark_forest', 'swamp'])),
      ambient_sound: Opt(StringNode()),
      mood_sound: Opt(ObjectNode({
        sound: StringNode(),
        tick_delay: NumberNode({ integer: true }),
        block_search_extent: NumberNode({ integer: true }),
        offset: NumberNode()
      })),
      additions_sound: Opt(ObjectNode({
        sound: StringNode(),
        tick_chance: NumberNode({ min: 0, max: 1 })
      })),
      music: Opt(ObjectNode({
        sound: StringNode(),
        min_delay: NumberNode({ integer: true, min: 0 }),
        max_delay: NumberNode({ integer: true, min: 0 }),
        replace_current_music: BooleanNode()
      })),
      particle: Opt(ObjectNode({
        options: ObjectNode({
          type: StringNode()
        }),
        probability: NumberNode({ min: 0, max: 1 })
      }))
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
      effects: {
        sky_color: 7907327,
        fog_color: 12638463,
        water_color: 4159204,
        water_fog_color: 329011
      }
    })
  }))
}
