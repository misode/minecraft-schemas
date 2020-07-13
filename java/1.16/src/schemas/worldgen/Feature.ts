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
} from '@mcschema/core'
import { BlockState, FluidState } from '../Common'
import './Decorator'
import './ProcessorList'

// TODO: investigate whether this object can also be defined as an integer
const BaseSpread = ObjectNode({
  base: NumberNode({ integer: true }),
  spread: NumberNode({ integer: true })
})

const RandomPatchOrFlower: NodeChildren = {
  can_replace: BooleanNode(),
  project: BooleanNode(),
  need_water: BooleanNode(),
  xspread: NumberNode({ integer: true }),
  yspread: NumberNode({ integer: true }),
  zspread: NumberNode({ integer: true }),
  tries: NumberNode({ integer: true }),
  state_provider: Force(Reference('block_state_provider')),
  block_placer: Force(Reference('block_placer')),
  whitelist: ListNode(
    BlockState
  ),
  blacklist: ListNode(
    BlockState
  )
}

const DiskOrIcePatch: NodeChildren = {
  state: BlockState,
  radius: BaseSpread,
  half_height: NumberNode({ integer: true }),
  targets: ListNode(
    BlockState
  )
}

const Feature = ChoiceNode([
  [
    'string',
    StringNode(),
    v => ''
  ],
  [
    'object',
    Reference('configured_feature'),
    v => ({})
  ]
], { choiceContext: 'feature' })

SCHEMAS.register('configured_feature', Mod(ObjectNode({
  name: Force(Resource(EnumNode('worldgen/feature', 'minecraft:tree'))),
  config: Force(ObjectNode({
    [Switch]: path => path.pop().push('name'),
    [Case]: {
      'minecraft:bamboo': {
        probability: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:basalt_columns': {
        reach: BaseSpread,
        height: BaseSpread
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
        contents: BlockState,
        rim: BlockState,
        size: BaseSpread,
        rim_size: BaseSpread
      },
      'minecraft:disk': DiskOrIcePatch,
      'minecraft:emerald_ore': {
        state: BlockState,
        target: BlockState
      },
      'minecraft:end_gateway': {
        exact: BooleanNode()
      },
      'minecraft:end_spike': {
        crystal_invulnerable: BooleanNode(),
        spikes: ListNode(Base) // TODO: find out what can be valid entries
      },
      'minecraft:fill_layer': {
        // TODO: find out how this can be used
      },
      'minecraft:flower': RandomPatchOrFlower,
      'minecraft:forest_rock': {
        state: BlockState
      },
      'minecraft:huge_brown_mushroom': {
        stem_provider: Force(Reference('block_state_provider')),
        cap_provider: Force(Reference('block_state_provider'))
      },
      'minecraft:huge_fungus': {
        hat_state: BlockState,
        decor_state: BlockState,
        stem_state: BlockState,
        valid_base_block: BlockState,
        planted: BooleanNode()
      },
      'minecraft:huge_red_mushroom': {
        stem_provider: Force(Reference('block_state_provider')),
        cap_provider: Force(Reference('block_state_provider'))
      },
      'minecraft:ice_patch': DiskOrIcePatch,
      'minecraft:iceberg': {
        state: BlockState
      },
      'minecraft:lake': {
        state: FluidState
      },
      'minecraft:nether_forest_vegetation': {
        state_provider: Reference('block_state_provider')
      },
      'minecraft:netherrack_replace_blobs': {
        state: BlockState,
        target: BlockState,
        radius: BaseSpread
      },
      'minecraft:no_surface_ore': {
        state: BlockState,
        size: NumberNode({ integer: true }),
        target: Force(Reference('block_predicate'))
      },
      'minecraft:ore': {
        state: BlockState,
        size: NumberNode({ integer: true }),
        target: Force(Reference('block_predicate'))
      },
      'minecraft:random_patch': RandomPatchOrFlower,
      'minecraft:random_boolean_selector': {
        feature_false: Feature,
        feature_true: Feature
      },
      'minecraft:random_selector': {
        features: ListNode(
          ObjectNode({
            feature: Feature,
            chance: NumberNode({ min: 0, max: 1 })
          })
        ),
        default: Force(Feature)
      },
      'minecraft:sea_pickle': {
        count: NumberNode({ integer: true, min: 0 })
      },
      'minecraft:seagrass': {
        probability: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:simple_block': {
        to_place: BlockState,
        place_on: BlockState,
        place_in: BlockState,
        place_under: BlockState
      },
      'minecraft:simple_random_selector': {
        features: ListNode(
          Feature
        )
      },
      'minecraft:spring_feature': {
        state: FluidState,
        rock_count: NumberNode({ integer: true }),
        hole_count: NumberNode({ integer: true }),
        required_block_below: BooleanNode(),
        valid_blocks: ListNode(
          EnumNode('block')
        )
      },
      'minecraft:tree': {
        max_water_depth: NumberNode({ integer: true }),
        ignore_vines: BooleanNode(),
        heightmap: EnumNode([
          'OCEAN_FLOOR',
          'MOTION_BLOCKING',
          'MOTION_BLOCKING_NO_LEAVES'
        ], 'OCEAN_FLOOR'),
        minimum_size: Force(ObjectNode({
          type: EnumNode('worldgen/feature_size_type', 'minecraft:two_layers_feature_size'),
          [Switch]: path => path.push('type'),
          [Case]: {
            'minecraft:two_layers_feature_size': {
              limit: NumberNode({ integer: true }),
              lower_size: NumberNode({ integer: true }),
              upper_size: NumberNode({ integer: true })
            },
            'minecraft:three_layers_feature_size': {
              limit: NumberNode({ integer: true }),
              upper_limit: NumberNode({ integer: true }),
              lower_size: NumberNode({ integer: true }),
              middle_size: NumberNode({ integer: true }),
              upper_size: NumberNode({ integer: true })
            }
          }
        })),
        trunk_provider: Force(Reference('block_state_provider')),
        leaves_provider: Force(Reference('block_state_provider')),
        trunk_placer: Force(ObjectNode({
          type: Force(EnumNode('worldgen/trunk_placer_type', 'minecraft:straight_trunk_placer')),
          base_height: NumberNode({ integer: true }),
          height_rand_a: NumberNode({ integer: true }),
          height_rand_b: NumberNode({ integer: true })
        })),
        foliage_placer: ObjectNode({
          type: Force(EnumNode('worldgen/foliage_placer_type', 'minecraft:blob_foliage_placer')),
          radius: NumberNode({ integer: true }),
          offset: NumberNode({ integer: true }),
          [Switch]: path => path.push('type'),
          [Case]: {
            'minecraft:blob_foliage_placer': {
              height: NumberNode({ integer: true })
            },
            'minecraft:bush_foliage_placer': {
              height: NumberNode({ integer: true })
            },
            'minecraft:jungle_foliage_placer': {
              height: NumberNode({ integer: true })
            },
            'minecraft:mega_pine_foliage_placer': {
              crown_height: BaseSpread
            },
            'minecraft:pine_foliage_placer': {
              height: BaseSpread
            }
          }
        }),
        decorators: ListNode(
          ObjectNode({
            type: EnumNode('worldgen/tree_decorator_type', 'minecraft:alter_ground'),
            [Switch]: path => path.push('type'),
            [Case]: {
              'minecraft:alter_ground': {
                provider: Reference('block_state_provider')
              },
              'minecraft:beehive': {
                probability: NumberNode({ min: 0, max: 1 })
              },
              'minecraft:cocoa': {
                probability: NumberNode({ min: 0, max: 1 })
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
      state: BlockState
    },
    'minecraft:simple_state_provider': {
      state: BlockState
    },
    'minecraft:weighted_state_provider': {
      entries: ListNode(
        Mod(ObjectNode({
          weight: NumberNode({ integer: true, min: 1 }),
          data: BlockState
        }), {
          default: () => ({
            weight: 1
          })
        })
      )
    }
  }
}))

SCHEMAS.register('block_placer', ObjectNode({
  type: Force(EnumNode('worldgen/block_placer_type', 'minecraft:simple_block_placer')),
  [Switch]: path => path.push('type'),
  [Case]: {
    'minecraft:column_placer': {
      min_size: NumberNode({ integer: true }),
      extra_size: NumberNode({ integer: true })
    }
  }
}))
