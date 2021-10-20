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
  Opt,
  ListNode,
  BooleanNode,
} from '@mcschema/core'
import { IntProvider } from '../Common'

export function initDecoratorSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  const CountConfig: NodeChildren = {
    count: IntProvider({ min: 0, max: 256 })
  }

  schemas.register('configured_decorator', ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/decorator' } }),
    config: ObjectNode({
      [Switch]: ['pop', { push: 'type' }],
      [Case]: {
        'minecraft:block_filter': {
          predicate: Reference('block_predicate_worldgen')
        },
        'minecraft:carving_mask': {
          step: StringNode({ enum: 'generation_step' })
        },
        'minecraft:cave_surface': {
          surface: StringNode({ enum: ['floor', 'ceiling']}),
          floor_to_ceiling_search_range: NumberNode({ integer: true }),
          allow_water: BooleanNode(),
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
          noise_offset: Opt(NumberNode())
        },
        'minecraft:decorated': {
          outer: Reference('configured_decorator'),
          inner: Reference('configured_decorator')
        },
        'minecraft:environment_scan': {
          direction_of_search: StringNode({ enum: ['up', 'down'] }),
          max_steps: NumberNode({ integer: true, min: 1, max: 32 }),
          target_condition: Reference('block_predicate_worldgen')
        },
        'minecraft:heightmap': {
          heightmap: StringNode({ enum: 'heightmap_type' })
        },
        'minecraft:lava_lake': {
          chance: NumberNode({ integer: true, min: 0 })
        },
        'minecraft:range': {
          height: Reference('height_provider')
        },
        'minecraft:scatter': {
          xz_spread: IntProvider({ min: -16, max: 16 }),
          y_spread: IntProvider({ min: -16, max: 16 }),
        },
        'minecraft:surface_relative_threshold': {
          heightmap: StringNode({ enum: 'heightmap_type' }),
          min_inclusive: Opt(NumberNode({ integer: true })),
          max_inclusive: Opt(NumberNode({ integer: true }))
        },
        'minecraft:water_depth_threshold': {
          max_water_depth: NumberNode({ integer: true })
        }
      }
    }, { context: 'decorator', category: 'predicate' })
  }, { context: 'decorator', category: 'predicate' }))
}
