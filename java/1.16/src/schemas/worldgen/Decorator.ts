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

const RangeConfig: NodeChildren = {
  maximum: NumberNode({ integer: true, min: 0 }),
  bottom_offset: NumberNode({ integer: true }),
  top_offset: NumberNode({ integer: true })
}

const ChanceConfig: NodeChildren = {
  count: NumberNode({ integer: true, min: 0 })
}

const CountConfig: NodeChildren = {
  count: NumberNode({ integer: true, min: 0 })
}

SCHEMAS.register('configured_decorator', ObjectNode({
  name: Force(Resource(EnumNode('worldgen/decorator', 'minecraft:count'))),
  config: ObjectNode({
    [Switch]: path => path.pop().push('name'),
    [Case]: {
      'minecraft:carving_mask': {
        step: EnumNode(['air', 'liquid'], 'air'),
        probability: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:chance': ChanceConfig,
      'minecraft:count': CountConfig,
      'minecraft:count_extra': {
        count: NumberNode({ integer: true, min: 0 }),
        extra_count: NumberNode({ integer: true, min: 0 }),
        extra_chance: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:count_multilayer': CountConfig,
      'minecraft:count_noise': {
        noise_level: NumberNode(),
        below_noise: NumberNode({ integer: true }),
        above_noise: NumberNode({ integer: true })
      },
      'minecraft:count_noise_biased': {
        noise_to_count_ratio: NumberNode({ integer: true }),
        noise_factor: NumberNode(),
        noise_offset: NumberNode()
      },
      'minecraft:decorated': {
        outer: Force(Reference('configured_decorator')),
        inner: Force(Reference('configured_decorator'))
      },
      'minecraft:depth_average': {
        baseline: NumberNode({ integer: true }),
        spread: NumberNode({ integer: true })
      },
      'minecraft:fire': CountConfig,
      'minecraft:glowstone': CountConfig,
      'minecraft:lava_lake': ChanceConfig,
      'minecraft:range': RangeConfig,
      'minecraft:range_biased': RangeConfig,
      'minecraft:range_very_biased': RangeConfig,
      'minecraft:water_lake': ChanceConfig
    }
  }, { category: 'predicate' })
}, { category: 'predicate' }))
