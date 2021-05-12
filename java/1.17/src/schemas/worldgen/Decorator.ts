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
        'minecraft:carving_mask': {
          step: StringNode({ enum: 'generation_step' })
        },
        'minecraft:cave_surface': {
          surface: StringNode({ enum: ['floor', 'ceiling']}),
          floor_to_ceiling_search_range: NumberNode({ integer: true })
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
        'minecraft:heightmap': {
          heightmap: StringNode({ enum: 'heightmap_type' })
        },
        'minecraft:heightmap_spread_double': {
          heightmap: StringNode({ enum: 'heightmap_type' })
        },
        'minecraft:lava_lake': {
          chance: NumberNode({ integer: true, min: 0 })
        },
        'minecraft:range': {
          height: Reference('height_provider')
        },
        'minecraft:water_depth_threshold': {
          max_water_depth: NumberNode({ integer: true })
        }
      }
    }, { context: 'decorator', category: 'predicate' })
  }, { context: 'decorator', category: 'predicate' }))
}
