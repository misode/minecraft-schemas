import {
  Case,
  StringNode as RawStringNode,
  Mod,
  NodeChildren,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Switch,
  BooleanNode,
  ListNode,
  ChoiceNode,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'
import { FloatProvider, InclusiveRange, IntProvider, Tag } from '../Common'
import './Decorator'
import './ProcessorList'
import { Processors } from './ProcessorList'

export function initFeatureSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  const ConfiguredFeature = ChoiceNode([
    {
      type: 'string',
      node: StringNode({ validator: 'resource', params: { pool: '$worldgen/configured_feature' } })
    },
    {
      type: 'object',
      node: Reference('configured_feature')
    }
  ], { choiceContext: 'feature' })

  const PlacedFeature = ChoiceNode([
    {
      type: 'string',
      node: StringNode({ validator: 'resource', params: { pool: '$worldgen/placed_feature' } })
    },
    {
      type: 'object',
      node: Reference('placed_feature')
    }
  ], { choiceContext: 'placed_feature' })

  const RandomPatchConfig: NodeChildren = {
    tries: Opt(NumberNode({ integer: true, min: 1 })),
    xz_spread: Opt(NumberNode({ integer: true, min: 0 })),
    y_spread: Opt(NumberNode({ integer: true, min: 0 })),
    feature: PlacedFeature,
  }

  const HugeMushroomConfig: NodeChildren = {
    cap_provider: Reference('block_state_provider'),
    stem_provider: Reference('block_state_provider'),
    foliage_radius: Opt(NumberNode({ integer: true }))
  }

  const TargetBlockState = ObjectNode({
    target: Reference('rule_test'),
    state: Reference('block_state')
  })

  const OreConfig: NodeChildren = {
    size: NumberNode({ integer: true, min: 0, max: 64 }),
    discard_chance_on_air_exposure: NumberNode({ min: 0, max: 1 }),
    targets: ListNode(
      TargetBlockState
    )
  }

  const VegetationPatchConfig: NodeChildren = {
    surface: StringNode({ enum: 'cave_surface' }),
    depth: IntProvider({ min: 1, max: 128 }),
    vertical_range: NumberNode({ integer: true, min: 1, max: 256 }),
    extra_bottom_block_chance: NumberNode({ min: 0, max: 1}),
    extra_edge_column_chance: NumberNode({ min: 0, max: 1}),
    vegetation_chance: NumberNode({ min: 0, max: 1}),
    xz_radius: IntProvider(),
    replaceable: StringNode({ validator: 'resource', params: { pool: 'block', requireTag: true } }),
    ground_state: Reference('block_state_provider'),
    vegetation_feature: PlacedFeature
  }

  schemas.register('configured_feature', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/feature' } }),
    config: ObjectNode({
      [Switch]: ['pop', { push: 'type' }],
      [Case]: {
        'minecraft:bamboo': {
          probability: NumberNode({ min: 0, max: 1 })
        },
        'minecraft:basalt_columns': {
          reach: IntProvider({ min: 0, max: 3 }),
          height: IntProvider({ min: 1, max: 10 })
        },
        'minecraft:block_column': {
          direction: StringNode({ enum: ['up', 'down', 'north', 'east', 'south', 'west'] }),
          allowed_placement: Reference('block_predicate_worldgen'),
          prioritize_tip: BooleanNode(),
          layers: ListNode(
            ObjectNode({
              height: IntProvider({ min: 0 }),
              provider: Reference('block_state_provider')
            })
          )
        },
        'minecraft:block_pile': {
          state_provider: Reference('block_state_provider')
        },
        'minecraft:delta_feature': {
          contents: Reference('block_state'),
          rim: Reference('block_state'),
          size: IntProvider({ min: 0, max: 16 }),
          rim_size: IntProvider({ min: 0, max: 16 })
        },
        'minecraft:disk': {
          state_provider: Reference('rule_based_block_state_provider'),
          target: Reference('block_predicate_worldgen'),
          radius: IntProvider({ min: 0, max: 8 }),
          half_height: NumberNode({ integer: true, min: 0, max: 4 }),
        },
        'minecraft:dripstone_cluster': {
          floor_to_ceiling_search_range: NumberNode({ integer: true, min: 1, max: 512 }),
          height: IntProvider({ min: 0, max: 128 }),
          radius: IntProvider({ min: 0, max: 128 }),
          max_stalagmite_stalactite_height_diff: NumberNode({ integer: true, min: 0, max: 64 }),
          height_deviation: NumberNode({ integer: true, min: 1, max: 64 }),
          dripstone_block_layer_thickness: IntProvider({ min: 0, max: 128 }),
          density: FloatProvider({ min: 0, max: 2 }),
          wetness: FloatProvider({ min: 0, max: 2 }),
          chance_of_dripstone_column_at_max_distance_from_center: NumberNode({ min: 0, max: 1 }),
          max_distance_from_edge_affecting_chance_of_dripstone_column: NumberNode({ integer: true, min: 1, max: 64 }),
          max_distance_from_center_affecting_height_bias: NumberNode({ integer: true, min: 1, max: 64 })
        },
        'minecraft:end_gateway': {
          exact: BooleanNode(),
          exit: Opt(Reference('block_pos'))
        },
        'minecraft:end_spike': {
          crystal_invulnerable: Opt(BooleanNode()),
          crystal_beam_target: Opt(Reference('block_pos')),
          spikes: ListNode(
            ObjectNode({
              centerX: Opt(NumberNode({ integer: true })),
              centerZ: Opt(NumberNode({ integer: true })),
              radius: Opt(NumberNode({ integer: true })),
              height: Opt(NumberNode({ integer: true })),
              guarded: Opt(BooleanNode())
            })
          )
        },
        'minecraft:fill_layer': {
          state: Reference('block_state'),
          height: NumberNode({ integer: true, min: 0, max: 255 })
        },
        'minecraft:flower': RandomPatchConfig,
        'minecraft:forest_rock': {
          state: Reference('block_state')
        },
        'minecraft:fossil': {
          max_empty_corners_allowed: NumberNode({ integer: true, min: 0, max: 7 }),
          fossil_structures: ListNode(
            StringNode({ validator: 'resource', params: { pool: '$structure' } })
          ),
          overlay_structures: ListNode(
            StringNode({ validator: 'resource', params: { pool: '$structure' } })
          ),
          fossil_processors: Processors,
          overlay_processors: Processors,
        },
        'minecraft:geode': {
          blocks: ObjectNode({
            filling_provider: Reference('block_state_provider'),
            inner_layer_provider: Reference('block_state_provider'),
            alternate_inner_layer_provider: Reference('block_state_provider'),
            middle_layer_provider: Reference('block_state_provider'),
            outer_layer_provider: Reference('block_state_provider'),
            inner_placements: ListNode(
              Reference('block_state')
            ),
            cannot_replace: StringNode({ validator: 'resource', params: { pool: 'block', requireTag: true } }),
            invalid_blocks: StringNode({ validator: 'resource', params: { pool: 'block', requireTag: true } })
          }),
          layers: ObjectNode({
            filling: Opt(NumberNode({ min: 0.01, max: 50 })),
            inner_layer: Opt(NumberNode({ min: 0.01, max: 50 })),
            middle_layer: Opt(NumberNode({ min: 0.01, max: 50 })),
            outer_layer: Opt(NumberNode({ min: 0.01, max: 50 })),
          }),
          crack: ObjectNode({
            generate_crack_chance: Opt(NumberNode({ min: 0, max: 1 })),
            base_crack_size: Opt(NumberNode({ min: 0, max: 5 })),
            crack_point_offset: Opt(NumberNode({ min: 0, max: 10 })),
          }),
          noise_multiplier: Opt(NumberNode({ min: 0, max: 1 })),
          use_potential_placements_chance: Opt(NumberNode({ min: 0, max: 1 })),
          use_alternate_layer0_chance: Opt(NumberNode({ min: 0, max: 1 })),
          placements_require_layer0_alternate: Opt(BooleanNode()),
          outer_wall_distance: Opt(IntProvider({ min: 1, max: 20 })),
          distribution_points: Opt(IntProvider({ min: 1, max: 20 })),
          point_offset: Opt(IntProvider({ min: 0, max: 10 })),
          min_gen_offset: Opt(NumberNode({ integer: true })),
          max_gen_offset: Opt(NumberNode({ integer: true })),
          invalid_blocks_threshold: NumberNode({ integer: true })
        },
        'minecraft:multiface_growth': {
          block: Opt(StringNode({ validator: 'resource', params: { pool: ['minecraft:glow_lichen', 'minecraft:sculk_vein'] } })),
          search_range: Opt(NumberNode({ min: 1, max: 64, integer: true })),
          chance_of_spreading: Opt(NumberNode({ min: 0, max: 1 })),
          can_place_on_floor: Opt(BooleanNode()),
          can_place_on_ceiling: Opt(BooleanNode()),
          can_place_on_wall: Opt(BooleanNode()),
          can_be_placed_on: Tag({ resource: 'block' })
        },
        'minecraft:huge_brown_mushroom': HugeMushroomConfig,
        'minecraft:huge_fungus': {
          hat_state: Reference('block_state'),
          decor_state: Reference('block_state'),
          stem_state: Reference('block_state'),
          valid_base_block: Reference('block_state'),
          replaceable_blocks: Reference('block_predicate_worldgen'),
          planted: Opt(BooleanNode())
        },
        'minecraft:huge_red_mushroom': HugeMushroomConfig,
        'minecraft:iceberg': {
          state: Reference('block_state')
        },
        'minecraft:lake': {
          fluid: Reference('block_state_provider'),
          barrier: Reference('block_state_provider')
        },
        'minecraft:large_dripstone': {
          floor_to_ceiling_search_range: Opt(NumberNode({ integer: true, min: 1, max: 512 })),
          column_radius: IntProvider({ min: 0, max: 60 }),
          height_scale: FloatProvider({ min: 0, max: 20 }),
          max_column_radius_to_cave_height_ratio: NumberNode({ min: 0, max: 1 }),
          stalactite_bluntness: FloatProvider({ min: 0.1, max: 10 }),
          stalagmite_bluntness: FloatProvider({ min: 0.1, max: 10 }),
          wind_speed: FloatProvider({ min: 0, max: 2 }),
          min_radius_for_wind: NumberNode({ integer: true, min: 0, max: 100 }),
          min_bluntness_for_wind: NumberNode({ min: 0, max: 5 })
        },
        'minecraft:nether_forest_vegetation': {
          state_provider: Reference('block_state_provider'),
          spread_width: NumberNode({ integer: true, min: 1 }),
          spread_height: NumberNode({ integer: true, min: 1 })
        },
        'minecraft:netherrack_replace_blobs': {
          state: Reference('block_state'),
          target: Reference('block_state'),
          radius: IntProvider({ min: 0, max: 12 })
        },
        'minecraft:no_bonemeal_flower': RandomPatchConfig,
        'minecraft:ore': OreConfig,
        'minecraft:pointed_dripstone': {
          chance_of_taller_dripstone: Opt(NumberNode({ min: 0, max: 1 })),
          chance_of_directional_spread: Opt(NumberNode({ min: 0, max: 1 })),
          chance_of_spread_radius2: Opt(NumberNode({ min: 0, max: 1 })),
          chance_of_spread_radius3: Opt(NumberNode({ min: 0, max: 1 })),
        },
        'minecraft:random_patch': RandomPatchConfig,
        'minecraft:random_boolean_selector': {
          feature_false: PlacedFeature,
          feature_true: PlacedFeature
        },
        'minecraft:random_selector': {
          features: ListNode(
            ObjectNode({
              chance: NumberNode({ min: 0, max: 1 }),
              feature: PlacedFeature
            })
          ),
          default: PlacedFeature
        },
        'minecraft:replace_single_block': {
          targets: ListNode(
            TargetBlockState
          )
        },
        'minecraft:root_system': {
          required_vertical_space_for_tree: NumberNode({ integer: true, min: 1, max: 64 }),
          root_radius: NumberNode({ integer: true, min: 1, max: 64 }),
          root_placement_attempts: NumberNode({ integer: true, min: 1, max: 256 }),
          root_column_max_height: NumberNode({ integer: true, min: 1, max: 4096 }),
          hanging_root_radius: NumberNode({ integer: true, min: 1, max: 64 }),
          hanging_roots_vertical_span: NumberNode({ integer: true, min: 0, max: 16 }),
          hanging_root_placement_attempts: NumberNode({ integer: true, min: 0, max: 256 }),
          allowed_vertical_water_for_tree: NumberNode({ integer: true, min: 1, max: 64 }),
          root_replaceable: StringNode({ validator: 'resource', params: { pool: 'block', requireTag: true } }),
          root_state_provider: Reference('block_state_provider'),
          hanging_root_state_provider: Reference('block_state_provider'),
          allowed_tree_position: Reference('block_predicate_worldgen'),
          feature: PlacedFeature
        },
        'minecraft:scattered_ore': OreConfig,
        'minecraft:sculk_patch': {
          charge_count: NumberNode({ integer: true, min: 1, max: 32 }),
          amount_per_charge: NumberNode({ integer: true, min: 1, max: 500 }),
          spread_attempts: NumberNode({ integer: true, min: 1, max: 64 }),
          growth_rounds: NumberNode({ integer: true, min: 0, max: 8 }),
          spread_rounds: NumberNode({ integer: true, min: 0, max: 8 }),
          extra_rare_growths: IntProvider(),
          catalyst_chance: NumberNode({ min: 0, max: 1 }),
        },
        'minecraft:sea_pickle': {
          count: IntProvider({ min: 0, max: 256 })
        },
        'minecraft:seagrass': {
          probability: NumberNode({ min: 0, max: 1 })
        },
        'minecraft:simple_block': {
          to_place: Reference('block_state_provider')
        },
        'minecraft:simple_random_selector': {
          features: Tag({ resource: '$worldgen/placed_feature', inlineSchema: 'placed_feature' }),
        },
        'minecraft:spring_feature': {
          state: Reference('fluid_state'),
          rock_count: NumberNode({ integer: true }),
          hole_count: NumberNode({ integer: true }),
          requires_block_below: BooleanNode(),
          valid_blocks: Tag({ resource: 'block' })
        },
        'minecraft:tree': {
          ignore_vines: Opt(BooleanNode()),
          force_dirt: Opt(BooleanNode()),
          minimum_size: Reference('feature_size'),
          dirt_provider: Reference('block_state_provider'),
          trunk_provider: Reference('block_state_provider'),
          foliage_provider: Reference('block_state_provider'),
          root_placer: Opt(ObjectNode({
            type: StringNode({ validator: 'resource', params: { pool: 'worldgen/root_placer_type' } }),
            root_provider: Reference('block_state_provider'),
            trunk_offset_y: IntProvider(),
            above_root_placement: Opt(ObjectNode({
              above_root_provider: Reference('block_state_provider'),
              above_root_placement_chance: NumberNode({ min: 0, max: 1 })
            })),
            [Switch]: [{ push: 'type' }],
            [Case]: {
              'minecraft:mangrove_root_placer': {
                mangrove_root_placement: ObjectNode({
                  max_root_width: NumberNode({ integer: true, min: 1, max: 12 }),
                  max_root_length: NumberNode({ integer: true, min: 1, max: 64 }),
                  random_skew_chance: NumberNode({ min: 0, max: 1 }),
                  can_grow_through: Tag({ resource: 'block' }),
                  muddy_roots_in: Tag({ resource: 'block' }),
                  muddy_roots_provider: Reference('block_state_provider'),
                })
              }
            }
          }, { context: 'root_placer' })),
          trunk_placer: ObjectNode({
            type: StringNode({ validator: 'resource', params: { pool: 'worldgen/trunk_placer_type' } }),
            base_height: NumberNode({ integer: true, min: 0, max: 32 }),
            height_rand_a: NumberNode({ integer: true, min: 0, max: 24 }),
            height_rand_b: NumberNode({ integer: true, min: 0, max: 24 }),
            [Switch]: [{ push: 'type' }],
            [Case]: {
              'minecraft:bending_trunk_placer': {
                bend_length: IntProvider({ min: 1, max: 64 }),
                min_height_for_leaves: Opt(NumberNode({ integer: true, min: 1 }))
              },
              'minecraft:cherry_trunk_placer': {
                branch_count: IntProvider({ min: 1, max: 3 }),
                branch_horizontal_length: IntProvider({ min: 2, max: 16 }),
                branch_start_offset_from_top: ObjectNode({
                  min_inclusive: NumberNode({ integer: true, min: -16, max: 0 }),
                  max_inclusive: NumberNode({ integer: true, min: -16, max: 0 })
                }, { context: 'int_provider.value' }),
                branch_end_offset_from_top: IntProvider({ min: -16, max: 16 })
              },
              'minecraft:upwards_branching_trunk_placer': {
                extra_branch_steps: IntProvider({ min: 1 }),
                extra_branch_length: IntProvider({ min: 0 }),
                place_branch_per_log_probability: NumberNode({ min: 0, max: 1 }),
                can_grow_through: Tag({ resource: 'block' })
              }
            }
          }, { context: 'trunk_placer' }),
          foliage_placer: ObjectNode({
            type: StringNode({ validator: 'resource', params: { pool: 'worldgen/foliage_placer_type' } }),
            radius: IntProvider({ min: 0, max: 16 }),
            offset: IntProvider({ min: 0, max: 16 }),
            [Switch]: [{ push: 'type' }],
            [Case]: {
              'minecraft:blob_foliage_placer': {
                height: NumberNode({ integer: true, min: 0, max: 16 })
              },
              'minecraft:bush_foliage_placer': {
                height: NumberNode({ integer: true, min: 0, max: 16 })
              },
              'minecraft:cherry_foliage_placer': {
                height: IntProvider({ min: 4, max: 16 }),
                wide_bottom_layer_hole_chance: NumberNode({ min: 0, max: 1 }),
                corner_hole_chance: NumberNode({ min: 0, max: 1 }),
                hanging_leaves_chance: NumberNode({ min: 0, max: 1 }),
                hanging_leaves_extension_chance: NumberNode({ min: 0, max: 1 })
              },
              'minecraft:fancy_foliage_placer': {
                height: NumberNode({ integer: true, min: 0, max: 16 })
              },
              'minecraft:jungle_foliage_placer': {
                height: NumberNode({ integer: true, min: 0, max: 16 })
              },
              'minecraft:mega_pine_foliage_placer': {
                crown_height: IntProvider({ min: 0, max: 24 })
              },
              'minecraft:pine_foliage_placer': {
                height: IntProvider({ min: 0, max: 24 })
              },
              'minecraft:random_spread_foliage_placer': {
                foliage_height: IntProvider({ min: 1, max: 512 }),
                leaf_placement_attempts: NumberNode({ integer: true, min: 0, max: 256 })
              },
              'minecraft:spruce_foliage_placer': {
                trunk_height: IntProvider({ min: 0, max: 24 })
              }
            }
          }, { context: 'foliage_placer', disableSwitchContext: true }),
          decorators: ListNode(
            ObjectNode({
              type: StringNode({ validator: 'resource', params: { pool: 'worldgen/tree_decorator_type' } }),
              [Switch]: [{ push: 'type' }],
              [Case]: {
                'minecraft:alter_ground': {
                  provider: Reference('block_state_provider')
                },
                'minecraft:attached_to_leaves': {
                  probability: NumberNode({ min: 0, max: 1 }),
                  exclusion_radius_xz: NumberNode({ integer: true, min: 0, max: 16 }),
                  exclusion_radius_y: NumberNode({ integer: true, min: 0, max: 16 }),
                  required_empty_blocks: NumberNode({ integer: true, min: 1, max: 16 }),
                  block_provider: Reference('block_state_provider'),
                  directions: ListNode(
                    StringNode({ enum: 'direction' })
                  )
                },
                'minecraft:beehive': {
                  probability: NumberNode({ min: 0, max: 1 })
                },
                'minecraft:cocoa': {
                  probability: NumberNode({ min: 0, max: 1 })
                },
                'minecraft:leave_vine': {
                  probability: NumberNode({ min: 0, max: 1 })
                }
              }
            }, { context: 'tree_decorator' })
          )
        },
        'minecraft:twisting_vines': {
          spread_width: NumberNode({ integer: true, min: 1 }),
          spread_height: NumberNode({ integer: true, min: 1 }),
          max_height: NumberNode({ integer: true, min: 1 }),
        },
        'minecraft:underwater_magma': {
          floor_search_range: NumberNode({ integer: true, min: 0, max: 512 }),
          placement_radius_around_floor: NumberNode({ integer: true, min: 0, max: 64 }),
          placement_probability_per_valid_position: NumberNode({ min: 0, max: 1 })
        },
        'minecraft:vegetation_patch': VegetationPatchConfig,
        'minecraft:waterlogged_vegetation_patch': VegetationPatchConfig
      }
    }, { context: 'feature' })
  }, { context: 'feature' }), {
    default: () => ({
      type: 'minecraft:tree',
      config: {
        minimum_size: {
          type: 'minecraft:two_layers_feature_size'
        },
        trunk_placer: {
          type: 'minecraft:straight_trunk_placer',
          base_height: 5,
          height_rand_a: 2,
          height_rand_b: 0
        },
        foliage_placer: {
          type: 'minecraft:blob_foliage_placer',
          radius: 2,
          offset: 0,
          height: 3
        }
      }
    })
  }))

  schemas.register('placed_feature', Mod(ObjectNode({
    feature: ConfiguredFeature,
    placement: ListNode(
      Reference('decorator')
    )
  }, { context: 'placed_feature' }), {
    default: () => ({
      feature: 'minecraft:oak',
      placement: [
        {
          type: 'minecraft:count',
          count: 4
        },
        {
          type: 'minecraft:in_square'
        },
        {
          type: 'minecraft:heightmap',
          heightmap: 'OCEAN_FLOOR'
        }
      ]
    })
  }))

  schemas.register('feature_size', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/feature_size_type' } }),
    min_clipped_height: Opt(NumberNode({ min: 0, max: 80 })),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:two_layers_feature_size': {
        limit: Opt(NumberNode({ integer: true, min: 0, max: 81 })),
        lower_size: Opt(NumberNode({ integer: true, min: 0, max: 16 })),
        upper_size: Opt(NumberNode({ integer: true, min: 0, max: 16 }))
      },
      'minecraft:three_layers_feature_size': {
        limit: Opt(NumberNode({ integer: true, min: 0, max: 80 })),
        upper_limit: Opt(NumberNode({ integer: true, min: 0, max: 80 })),
        lower_size: Opt(NumberNode({ integer: true, min: 0, max: 16 })),
        middle_size: Opt(NumberNode({ integer: true, min: 0, max: 16 })),
        upper_size: Opt(NumberNode({ integer: true, min: 0, max: 16 }))
      }
    }
  }, { disableSwitchContext: true }), {
    default: () => ({
      type: 'minecraft:two_layers_feature_size'
    })
  }))

  const NoiseProvider: NodeChildren = {
    seed: NumberNode({ integer: true }),
    noise: Reference('noise_parameters'),
    scale: Mod(NumberNode({ min: Number.MIN_VALUE }), { default: () => 1 })
  }

  schemas.register('block_state_provider', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/block_state_provider_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:dual_noise_provider': {
        ...NoiseProvider,
        variety: InclusiveRange({ integer: true, min: 1, max: 64 }),
        slow_noise: Reference('noise_parameters'),
        slow_scale: Mod(NumberNode({ min: Number.MIN_VALUE }), { default: () => 1 }),
        states: ListNode(
          Reference('block_state')
        )
      },
      'minecraft:noise_threshold_provider': {
        ...NoiseProvider,
        threshold: NumberNode({ min: -1, max: 1 }),
        high_chance: NumberNode({ min: 0, max: 1 }),
        default_state: Reference('block_state'),
        low_states: ListNode(
          Reference('block_state')
        ),
        high_states: ListNode(
          Reference('block_state')
        )
      },
      'minecraft:noise_provider': {
        ...NoiseProvider,
        states: ListNode(
          Reference('block_state')
        )
      },
      'minecraft:randomized_int_state_provider': {
        property: StringNode(),
        values: IntProvider(),
        source: Reference('block_state_provider')
      },
      'minecraft:rotated_block_provider': {
        state: Reference('block_state')
      },
      'minecraft:simple_state_provider': {
        state: Reference('block_state')
      },
      'minecraft:weighted_state_provider': {
        entries: ListNode(
          Mod(ObjectNode({
            weight: NumberNode({ integer: true, min: 1 }),
            data: Reference('block_state')
          }), {
            default: () => ({
              data: {}
            })
          })
        )
      }
    }
  }, { context: 'block_state_provider' }), {
    default: () => ({
      type: 'minecraft:simple_state_provider'
    })
  }))

  schemas.register('rule_based_block_state_provider', Mod(ObjectNode({
    fallback: Reference('block_state_provider'),
    rules: ListNode(
      ObjectNode({
        if_true: Reference('block_predicate_worldgen'),
        then: Reference('block_state_provider')
      })
    )
  }, { context: 'block_state_provider' }), {
    default: () => ({
      fallback: {
        type: 'minecraft:simple_state_provider'
      }
    })
  }))

  const Offset: NodeChildren = {
    offset: Opt(ListNode(
      NumberNode({ integer: true, min: -16, max: 16 }),
      { minLength: 3, maxLength: 3 }
    ))
  }

  schemas.register('block_predicate_worldgen', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'block_predicate_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:all_of': {
        predicates: ListNode(
          Reference('block_predicate_worldgen')
        )
      },
      'minecraft:any_of': {
        predicates: ListNode(
          Reference('block_predicate_worldgen')
        )
      },
      'minecraft:has_sturdy_face': {
        ...Offset,
        direction: StringNode({ enum: 'direction' })
      },
      'minecraft:inside_world_bounds': {
        ...Offset,
      },
      'minecraft:matching_block_tag': {
        ...Offset,
        tag: StringNode({ validator: 'resource', params: { pool: '$tag/block' } })
      },
      'minecraft:matching_blocks': {
        ...Offset,
        blocks: Tag({ resource: 'block' })
      },
      'minecraft:matching_fluids': {
        ...Offset,
        fluids: Tag({ resource: 'fluid' })
      },
      'minecraft:not': {
        predicate: Reference('block_predicate_worldgen')
      },
      'minecraft:unobstructed': {
        ...Offset,
      },
      'minecraft:would_survive': {
        ...Offset,
        state: Reference('block_state')
      }
    }
  }, { context: 'block_predicate' }), {
    default: () => ({
      type: 'minecraft:true'
    })
  }))
}
