import {
  Case,
  StringNode as RawStringNode,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
  ListNode,
} from '@mcschema/core'
import { IntProvider } from '../Common'

export function initDecoratorSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('decorator', ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/placement_modifier_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:block_predicate_filter': {
        predicate: Reference('block_predicate_worldgen')
      },
      'minecraft:rarity_filter': {
        chance: NumberNode({ integer: true, min: 0 })
      },
      'minecraft:count': {
        count: IntProvider({ min: 0, max: 256 })
      },
      'minecraft:count_on_every_layer': {
        count: IntProvider({ min: 0, max: 256 })
      },
      'minecraft:noise_threshold_count': {
        noise_level: NumberNode(),
        below_noise: NumberNode({ integer: true }),
        above_noise: NumberNode({ integer: true })
      },
      'minecraft:noise_based_count': {
        noise_to_count_ratio: NumberNode({ integer: true }),
        noise_factor: NumberNode(),
        noise_offset: Opt(NumberNode())
      },
      'minecraft:environment_scan': {
        direction_of_search: StringNode({ enum: ['up', 'down'] }),
        max_steps: NumberNode({ integer: true, min: 1, max: 32 }),
        target_condition: Reference('block_predicate_worldgen'),
        allowed_search_condition: Opt(Reference('block_predicate_worldgen'))
      },
      'minecraft:heightmap': {
        heightmap: StringNode({ enum: 'heightmap_type' })
      },
      'minecraft:height_range': {
        height: Reference('height_provider')
      },
      'minecraft:random_offset': {
        xz_spread: IntProvider({ min: -16, max: 16 }),
        y_spread: IntProvider({ min: -16, max: 16 }),
      },
      'minecraft:fixed_placement': {
        positions: ListNode(ListNode(
          NumberNode({ integer: true }),
          { minLength: 3, maxLength: 3 }
        ))
      },
      'minecraft:surface_relative_threshold_filter': {
        heightmap: StringNode({ enum: 'heightmap_type' }),
        min_inclusive: Opt(NumberNode({ integer: true })),
        max_inclusive: Opt(NumberNode({ integer: true }))
      },
      'minecraft:surface_water_depth_filter': {
        max_water_depth: NumberNode({ integer: true })
      }
    }
  }, { context: 'decorator', category: 'predicate' }))
}
