import {
  Case,
  StringNode as RawStringNode,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Switch,
  NodeChildren,
  SchemaRegistry,
  CollectionRegistry,
  ChoiceNode,
} from '@mcschema/core'
import { UniformInt } from '../Common'

export function initDecoratorSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  const VerticalAnchor = ChoiceNode(
    ['absolute', 'above_bottom', 'below_top'].map(t => ({
      type: t,
      match: v => v?.[t] !== undefined,
      change: v => ({ [t]: v.absolute ?? v.above_bottom ?? v.below_top ?? 0 }),
      node: ObjectNode({
        [t]: NumberNode({ integer: true, min: -2048, max: 2047 })
      })
    })),
    { context: 'vertical_anchor' }
  )

  const RangeConfig: NodeChildren = {
    bottom_inclusive: VerticalAnchor,
    top_inclusive: VerticalAnchor
  }

  const CountConfig: NodeChildren = {
    count: UniformInt({ min: -10, max: 128, maxSpread: 128 })
  }

  schemas.register('configured_decorator', ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/decorator' } }),
    config: ObjectNode({
      [Switch]: ['pop', { push: 'type' }],
      [Case]: {
        'minecraft:carving_mask': {
          step: StringNode({ enum: 'generation_step' })
        },
        'minecraft:chance': {
          chance: NumberNode({ integer: true, min: 0 })
        },
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
          outer: Reference('configured_decorator'),
          inner: Reference('configured_decorator')
        },
        'minecraft:depth_average': {
          baseline: VerticalAnchor,
          spread: NumberNode({ integer: true })
        },
        'minecraft:glowstone': CountConfig,
        'minecraft:range': RangeConfig,
        'minecraft:range_biased_to_bottom': RangeConfig,
        'minecraft:range_very_biased_to_bottom': RangeConfig
      }
    }, { context: 'decorator', category: 'predicate' })
  }, { context: 'decorator', category: 'predicate' }))
}
