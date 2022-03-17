import {
  BooleanNode,
  StringNode as RawStringNode,
  ListNode,
  MapNode,
  Mod,
  NumberNode,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
  INode,
} from '@mcschema/core'
import { Tag } from '../Common'

export let MobCategorySpawnSettings: INode

export function initBiomeSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)

  MobCategorySpawnSettings = Mod(ListNode(
    ObjectNode({
      type: StringNode({ validator: 'resource', params: { pool: 'entity_type' } }),
      weight: NumberNode({ integer: true }),
      minCount: NumberNode({ integer: true }),
      maxCount: NumberNode({ integer: true })
    })
  ), {
    category: () => 'pool',
    default: () => [{
      type: 'minecraft:bat',
      weight: 1
    }]
  })

  schemas.register('biome', Mod(ObjectNode({
    temperature: NumberNode(),
    downfall: NumberNode(),
    precipitation: StringNode({ enum: ['none', 'rain', 'snow'] }),
    temperature_modifier: Opt(StringNode({ enum: ['none', 'frozen'] })),
    category: StringNode({ enum: 'biome_category' }),
    creature_spawn_probability: Opt(NumberNode({ min: 0, max: 1 })),
    effects: ObjectNode({
      sky_color: NumberNode({ color: true }),
      fog_color: NumberNode({ color: true }),
      water_color: NumberNode({ color: true }),
      water_fog_color: NumberNode({ color: true }),
      grass_color: Opt(NumberNode({ color: true })),
      foliage_color: Opt(NumberNode({ color: true })),
      grass_color_modifier: Opt(StringNode({ enum: ['none', 'dark_forest', 'swamp'] })),
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
    }),
    spawners: MapNode(
      StringNode({ enum: 'mob_category' }),
      MobCategorySpawnSettings
    ),
    spawn_costs: MapNode(
      StringNode({ validator: 'resource', params: { pool: 'entity_type' } }),
      Mod(ObjectNode({
        energy_budget: NumberNode(),
        charge: NumberNode()
      }, { category: 'function' }), {
        default: () => ({
          energy_budget: 0.12,
          charge: 1.0
        })
      })
    ),
    carvers: MapNode(
      StringNode({ enum: ['air', 'liquid'] }),
      Mod(Tag({ resource: '$worldgen/configured_carver', inlineSchema: 'configured_carver' }), {
        default: () => ['minecraft:cave']
      })
    ),
    features: ListNode(
      Mod(Tag({ resource: '$worldgen/placed_feature', inlineSchema: 'placed_feature' }), { category: () => 'predicate' }),
      { maxLength: 11 }
    )
  }, { context: 'biome' }), {
    default: () => ({
      temperature: 0.8,
      downfall: 0.4,
      precipitation: 'rain',
      category: 'plains',
      effects: {
        sky_color: 7907327,
        fog_color: 12638463,
        water_color: 4159204,
        water_fog_color: 329011
      }
    })
  }))
}
