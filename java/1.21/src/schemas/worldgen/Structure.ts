import {
  BooleanNode,
  Case,
  StringNode as RawStringNode,
  Reference as RawReference,
  Mod,
  NodeChildren,
  NumberNode,
  ObjectNode,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
  MapNode,
  ListNode,
  ChoiceNode,
} from '@mcschema/core'
import { Tag } from '../Common'
import { MobCategorySpawnSettings } from './Biome'

export function initStructureSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)
  const Reference = RawReference.bind(undefined, schemas)

  schemas.register('structure', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/structure_type' } }),
    biomes: Tag({ resource: '$worldgen/biome' }),
    step: StringNode({ enum: 'decoration_step' }),
    spawn_overrides: MapNode(
      StringNode({ enum: 'mob_category' }),
      ObjectNode({
        bounding_box: StringNode({ enum: ['piece', 'full'] }),
        spawns: MobCategorySpawnSettings,
      })
    ),
    terrain_adaptation: Opt(StringNode({ enum: ['none', 'beard_thin', 'beard_box', 'bury', 'encapsulate'] })),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:jigsaw': {
        start_pool: StringNode({ validator: 'resource', params: { pool: '$worldgen/template_pool'}}),
        size: NumberNode({ integer: true, min: 0, max: 20}),
        start_height: Reference('height_provider'),
        start_jigsaw_name: Opt(StringNode()),
        project_start_to_heightmap: Opt(StringNode({ enum: 'heightmap_type' })),
        max_distance_from_center: Mod(NumberNode({ integer: true, min: 1, max: 128 }), { default: () => 80 }),
        use_expansion_hack: BooleanNode(),
        dimension_padding: Opt(Reference('dimension_padding')),
        liquid_settings: StringNode({ enum: ['apply_waterlogging', 'ignore_waterlogging'] }),
        pool_aliases: Opt(ListNode(Reference('pool_alias_binding')))
      },
      'minecraft:mineshaft': {
        mineshaft_type: StringNode({ enum: ['normal', 'mesa'] }),
      },
      'minecraft:nether_fossil': {
        height: Reference('height_provider')
      },
      'minecraft:ocean_ruin': {
        biome_temp: StringNode({ enum: ['cold', 'warm'] }),
        large_probability: NumberNode({ min: 0, max: 1 }),
        cluster_probability: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:ruined_portal': {
        setups: ListNode(
          ObjectNode({
            placement: StringNode({ enum: ['on_land_surface', 'partly_buried', 'on_ocean_floor', 'in_mountain', 'underground', 'in_nether'] }),
            air_pocket_probability: NumberNode({ min: 0, max: 1 }),
            mossiness: NumberNode({ min: 0, max: 1 }),
            overgrown: BooleanNode(),
            vines: BooleanNode(),
            can_be_cold: BooleanNode(),
            replace_with_blackstone: BooleanNode(),
            weight: NumberNode({ min: 0 })
          })
        )
      },
      'minecraft:shipwreck': {
        is_beached: Opt(BooleanNode())
      }
    }
  }, { context: 'structure_feature' }), {
    default: () => ({
      type: 'minecraft:jigsaw',
      step: 'surface_structures',
      size: 6,
      max_distance_from_center: 80,
    })
  }))

  schemas.register('dimension_padding', ChoiceNode([
    {
      type: 'number',
      node: NumberNode({ integer: true, min: 0 }),
      change: (v) => typeof v === 'object' ? (v?.bottom ?? v?.top ?? 0) : 0,
    },
    {
      type: 'object',
      node: ObjectNode({
        bottom: Opt(NumberNode({ integer: true, min: 0 })),
        top: Opt(NumberNode({ integer: true, min: 0 })),
      }),
      change: (v) => typeof v === 'number' ? ({ bottom: v, top: v }) : ({}),
    }
  ], { context: 'dimension_padding' }))

  schemas.register('pool_alias_binding', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/pool_alias_binding' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:direct': {
        alias: StringNode({ validator: 'resource', params: { pool: '$worldgen/template_pool' } }),
        target: StringNode({ validator: 'resource', params: { pool: '$worldgen/template_pool' } })
      },
      'minecraft:random': {
        alias: StringNode({ validator: 'resource', params: { pool: '$worldgen/template_pool' } }),
        targets: ListNode(
          Mod(ObjectNode({
            weight: NumberNode({ integer: true, min: 1 }),
            data: StringNode({ validator: 'resource', params: { pool: '$worldgen/template_pool' } })
          }), {
            default: () => ({
              data: {}
            })
          })
        )
      },
      'minecraft:random_group': {
        groups: ListNode(ObjectNode({
          weight: NumberNode({ integer: true }),
          data: Reference('pool_alias_binding'),
        }))
      }
    }
  }, { context: 'pool_alias_binding' }), {
    default: () => ({
      type: 'minecraft:direct',
      alias: 'minecraft:empty',
      target: 'minecraft:empty'
    })
  }))
}
