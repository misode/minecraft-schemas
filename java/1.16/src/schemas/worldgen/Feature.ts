import {
  Case,
  EnumNode,
  Force,
  Mod,
  NodeChildren,
  NumberNode,
  ObjectNode,
  Reference,
  Resource,
  SCHEMAS,
  Switch,
  BooleanNode,
  ListNode,
  Base,
  StringNode,
  ChoiceNode,
  UniformIntNode,
} from '@mcschema/core'
import { BlockState, FluidState, BlockPos } from '../Common'
import './Decorator'
import './ProcessorList'

const RandomPatchConfig: NodeChildren = {
  can_replace: BooleanNode(),
  project: BooleanNode(),
  need_water: BooleanNode(),
  xspread: NumberNode({ integer: true }),
  yspread: NumberNode({ integer: true }),
  zspread: NumberNode({ integer: true }),
  tries: NumberNode({ integer: true }),
  state_provider: Force(Reference('block_state_provider')),
  block_placer: Force(Reference('block_placer')),
  whitelist: Force(ListNode(
    BlockState
  )),
  blacklist: Force(ListNode(
    BlockState
  ))
}

const DiskConfig: NodeChildren = {
  state: Force(BlockState),
  radius: Force(UniformIntNode({ min: 0, max: 4, maxSpread: 4})),
  half_height: Force(NumberNode({ integer: true, min: 0, max: 4 })),
  targets: Force(ListNode(
    BlockState
  ))
}

const HugeMushroomConfig: NodeChildren = {
  cap_provider: Force(Reference('block_state_provider')),
  stem_provider: Force(Reference('block_state_provider')),
  foliage_radius: NumberNode({ integer: true })
}

const OreConfig: NodeChildren = {
  state: Force(BlockState),
  size: Force(NumberNode({ integer: true, min: 0, max: 64 })),
  target: Force(Reference('block_predicate'))
}

const CountConfig: NodeChildren = {
  count: Force(UniformIntNode({ min: -10, max: 128, maxSpread: 128 }))
}

const Feature = ChoiceNode([
  {
    type: 'string',
    node: StringNode()
  },
  {
    type: 'object',
    node: Reference('configured_feature')
  }
], { choiceContext: 'feature' })

SCHEMAS.register('configured_feature', Mod(ObjectNode({
  name: Force(Resource(EnumNode('worldgen/feature', 'minecraft:tree'))),
  config: Force(ObjectNode({
    [Switch]: path => path.pop().push('name'),
    [Case]: {
      'minecraft:bamboo': {
        probability: Force(NumberNode({ min: 0, max: 1 }))
      },
      'minecraft:basalt_columns': {
        reach: Force(UniformIntNode({ min: 0, max: 2, maxSpread: 1})),
        height: Force(UniformIntNode({ min: 1, max: 5, maxSpread: 5}))
      },
      'minecraft:block_pile': {
        state_provider: Force(Reference('block_state_provider'))
      },
      'minecraft:decorated': {
        decorator: Force(Reference('configured_decorator')),
        feature: Force(Feature)
      },
      'minecraft:decorated_flower': {
        decorator: Force(Reference('configured_decorator')),
        feature: Force(Feature)
      },
      'minecraft:delta_feature': {
        contents: Force(BlockState),
        rim: Force(BlockState),
        size: Force(UniformIntNode({ min: 0, max: 8, maxSpread: 8})),
        rim_size: Force(UniformIntNode({ min: 0, max: 8, maxSpread: 8}))
      },
      'minecraft:disk': DiskConfig,
      'minecraft:emerald_ore': {
        state: Force(BlockState),
        target: Force(BlockState)
      },
      'minecraft:end_gateway': {
        exact: Force(BooleanNode()),
        exit: BlockPos
      },
      'minecraft:end_spike': {
        crystal_invulnerable: Force(BooleanNode()),
        crystal_beam_target: BlockPos,
        spikes: Force(ListNode(
          ObjectNode({
            centerX: NumberNode({ integer: true }),
            centerZ: NumberNode({ integer: true }),
            radius: NumberNode({ integer: true }),
            height: NumberNode({ integer: true }),
            guarded: BooleanNode()
          })
        ))
      },
      'minecraft:fill_layer': {
        state: BlockState,
        height: NumberNode({ integer: true, min: 0, max: 255 })
      },
      'minecraft:flower': RandomPatchConfig,
      'minecraft:forest_rock': {
        state: Force(BlockState)
      },
      'minecraft:huge_brown_mushroom': HugeMushroomConfig,
      'minecraft:huge_fungus': {
        hat_state: Force(BlockState),
        decor_state: Force(BlockState),
        stem_state: Force(BlockState),
        valid_base_block: Force(BlockState),
        planted: BooleanNode()
      },
      'minecraft:huge_red_mushroom': HugeMushroomConfig,
      'minecraft:ice_patch': DiskConfig,
      'minecraft:iceberg': {
        state: Force(BlockState)
      },
      'minecraft:lake': {
        state: Force(BlockState)
      },
      'minecraft:nether_forest_vegetation': {
        state_provider: Reference('block_state_provider')
      },
      'minecraft:netherrack_replace_blobs': {
        state: Force(BlockState),
        target: Force(BlockState),
        radius: Force(UniformIntNode())
      },
      'minecraft:no_surface_ore': OreConfig,
      'minecraft:ore': OreConfig,
      'minecraft:random_patch': RandomPatchConfig,
      'minecraft:random_boolean_selector': {
        feature_false: Force(Feature),
        feature_true: Force(Feature)
      },
      'minecraft:random_selector': {
        features: Force(ListNode(
          ObjectNode({
            chance: Force(NumberNode({ min: 0, max: 1 })),
            feature: Force(Feature)
          })
        )),
        default: Force(Feature)
      },
      'minecraft:sea_pickle': CountConfig,
      'minecraft:seagrass': {
        probability: Force(NumberNode({ min: 0, max: 1 }))
      },
      'minecraft:simple_block': {
        to_place: Force(BlockState),
        place_on: Force(ListNode(BlockState)),
        place_in: Force(ListNode(BlockState)),
        place_under: Force(ListNode(BlockState))
      },
      'minecraft:simple_random_selector': {
        features: Force(ListNode(
          Feature
        ))
      },
      'minecraft:spring_feature': {
        state: Force(FluidState),
        rock_count: NumberNode({ integer: true }),
        hole_count: NumberNode({ integer: true }),
        required_block_below: BooleanNode(),
        valid_blocks: Force(ListNode(
          EnumNode('block')
        ))
      },
      'minecraft:tree': {
        max_water_depth: NumberNode({ integer: true }),
        ignore_vines: BooleanNode(),
        heightmap: Force(EnumNode('heightmap_type', 'OCEAN_FLOOR')),
        minimum_size: Force(ObjectNode({
          type: Force(EnumNode('worldgen/feature_size_type', 'minecraft:two_layers_feature_size')),
          min_clipped_height: NumberNode({ min: 0, max: 80}),
          [Switch]: path => path.push('type'),
          [Case]: {
            'minecraft:two_layers_feature_size': {
              limit: NumberNode({ integer: true, min: 0, max: 81 }),
              lower_size: NumberNode({ integer: true, min: 0, max: 16 }),
              upper_size: NumberNode({ integer: true, min: 0, max: 16 })
            },
            'minecraft:three_layers_feature_size': {
              limit: NumberNode({ integer: true, min: 0, max: 80 }),
              upper_limit: NumberNode({ integer: true, min: 0, max: 80 }),
              lower_size: NumberNode({ integer: true, min: 0, max: 16 }),
              middle_size: NumberNode({ integer: true, min: 0, max: 16 }),
              upper_size: NumberNode({ integer: true, min: 0, max: 16 })
            }
          }
        })),
        trunk_provider: Force(Reference('block_state_provider')),
        leaves_provider: Force(Reference('block_state_provider')),
        trunk_placer: Force(ObjectNode({
          type: Force(EnumNode('worldgen/trunk_placer_type', 'minecraft:straight_trunk_placer')),
          base_height: Force(NumberNode({ integer: true, min: 0, max: 32 })),
          height_rand_a: Force(NumberNode({ integer: true, min: 0, max: 24 })),
          height_rand_b: Force(NumberNode({ integer: true, min: 0, max: 24 }))
        })),
        foliage_placer: ObjectNode({
          type: Force(EnumNode('worldgen/foliage_placer_type', 'minecraft:blob_foliage_placer')),
          radius: Force(UniformIntNode({ min: 0, max: 8, maxSpread: 8 })),
          offset: Force(UniformIntNode({ min: 0, max: 8, maxSpread: 8 })),
          [Switch]: path => path.push('type'),
          [Case]: {
            'minecraft:blob_foliage_placer': {
              height: Force(NumberNode({ integer: true, min: 0, max: 16 }))
            },
            'minecraft:bush_foliage_placer': {
              height: Force(NumberNode({ integer: true, min: 0, max: 16 }))
            },
            'minecraft:fancy_foliage_placer': {
              height: Force(NumberNode({ integer: true, min: 0, max: 16 }))
            },
            'minecraft:jungle_foliage_placer': {
              height: Force(NumberNode({ integer: true, min: 0, max: 16 }))
            },
            'minecraft:mega_pine_foliage_placer': {
              crown_height: Force(UniformIntNode({ min: 0, max: 16, maxSpread: 8 }))
            },
            'minecraft:pine_foliage_placer': {
              height: Force(UniformIntNode({ min: 0, max: 16, maxSpread: 8 }))
            },
            'minecraft:spruce_foliage_placer': {
              trunk_height: Force(UniformIntNode({ min: 0, max: 16, maxSpread: 8 }))
            }
          }
        }),
        decorators: ListNode(
          ObjectNode({
            type: EnumNode('worldgen/tree_decorator_type', 'minecraft:alter_ground'),
            [Switch]: path => path.push('type'),
            [Case]: {
              'minecraft:alter_ground': {
                provider: Force(Reference('block_state_provider'))
              },
              'minecraft:beehive': {
                probability: Force(NumberNode({ min: 0, max: 1 }))
              },
              'minecraft:cocoa': {
                probability: Force(NumberNode({ min: 0, max: 1 }))
              }
            }
          })
        )
      }
    }
  }, { context: 'feature' }))
}), {
  default: () => ({
    name: 'minecraft:decorated',
    config: {
      decorator: {
        name: 'minecraft:count',
        config: {
          count: 4
        }
      },
      feature: {
        name: 'minecraft:tree',
        config: {
          max_water_depth: 0,
          ignore_vines: true,
          minimum_size: {
            limit: 1,
            lower_size: 0,
            upper_size: 1
          },
          trunk_placer: {
            base_height: 5,
            height_rand_a: 2,
            height_rand_b: 0
          },
          foliage_placer: {
            radius: 2,
            offset: 0,
            height: 3
          }
        }
      }
    }
  })
}))

SCHEMAS.register('block_state_provider', ObjectNode({
  type: Force(EnumNode('worldgen/block_state_provider_type', 'minecraft:simple_state_provider')),
  [Switch]: path => path.push('type'),
  [Case]: {
    'minecraft:rotated_block_provider': {
      state: Force(BlockState)
    },
    'minecraft:simple_state_provider': {
      state: Force(BlockState)
    },
    'minecraft:weighted_state_provider': {
      entries: Force(ListNode(
        Mod(ObjectNode({
          weight: NumberNode({ integer: true, min: 1 }),
          data: Force(BlockState)
        }), {
          default: () => ({
            data: {}
          })
        })
      ))
    }
  }
}))

SCHEMAS.register('block_placer', ObjectNode({
  type: Force(EnumNode('worldgen/block_placer_type', 'minecraft:simple_block_placer')),
  [Switch]: path => path.push('type'),
  [Case]: {
    'minecraft:column_placer': {
      min_size: Force(NumberNode({ integer: true })),
      extra_size: Force(NumberNode({ integer: true }))
    }
  }
}))
