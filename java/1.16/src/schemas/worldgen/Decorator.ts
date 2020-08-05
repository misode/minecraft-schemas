import {
  Case,
  EnumNode,
  Force,
  NumberNode,
  ObjectNode,
  Reference,
  Resource,
  SCHEMAS,
  Switch,
  NodeChildren,
} from '@mcschema/core'
import { UniformInt } from '../Common' 

const RangeConfig: NodeChildren = {
  maximum: NumberNode({ integer: true }),
  bottom_offset: NumberNode({ integer: true }),
  top_offset: NumberNode({ integer: true })
}

const ChanceConfig: NodeChildren = {
  chance: Force(NumberNode({ integer: true, min: 0 }))
}

const CountConfig: NodeChildren = {
  count: Force(UniformInt({ min: -10, max: 128, maxSpread: 128 }))
}

SCHEMAS.register('configured_decorator', ObjectNode({
  type: Force(Resource(EnumNode('worldgen/decorator', 'minecraft:count'))),
  config: Force(ObjectNode({
    [Switch]: path => path.pop().push('type'),
    [Case]: {
      'minecraft:carving_mask': {
        step: Force(EnumNode('generation_step', 'air')),
        probability: Force(NumberNode({ min: 0, max: 1 }))
      },
      'minecraft:chance': ChanceConfig,
      'minecraft:count': CountConfig,
      'minecraft:count_extra': {
        count: Force(NumberNode({ integer: true, min: 0 })),
        extra_count: Force(NumberNode({ integer: true, min: 0 })),
        extra_chance: Force(NumberNode({ min: 0, max: 1 }))
      },
      'minecraft:count_multilayer': CountConfig,
      'minecraft:count_noise': {
        noise_level: Force(NumberNode()),
        below_noise: Force(NumberNode({ integer: true })),
        above_noise: Force(NumberNode({ integer: true }))
      },
      'minecraft:count_noise_biased': {
        noise_to_count_ratio: Force(NumberNode({ integer: true })),
        noise_factor: Force(NumberNode()),
        noise_offset: NumberNode()
      },
      'minecraft:decorated': {
        outer: Force(Reference('configured_decorator')),
        inner: Force(Reference('configured_decorator'))
      },
      'minecraft:depth_average': {
        baseline: Force(NumberNode({ integer: true })),
        spread: Force(NumberNode({ integer: true }))
      },
      'minecraft:fire': CountConfig,
      'minecraft:glowstone': CountConfig,
      'minecraft:lava_lake': ChanceConfig,
      'minecraft:range': RangeConfig,
      'minecraft:range_biased': RangeConfig,
      'minecraft:range_very_biased': RangeConfig,
      'minecraft:water_lake': ChanceConfig
    }
  }, { category: 'predicate' }))
}, { category: 'predicate' }))
