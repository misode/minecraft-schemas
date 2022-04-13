import {
  StringNode as RawStringNode,
  Mod,
  NumberNode,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  NodeChildren,
  Switch,
  Case,
  Opt,
  BooleanNode,
  Reference as RawReference,
} from '@mcschema/core'
import { FloatProvider, Tag } from '../Common'

export function initCarverSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  const CanyonConfig: NodeChildren = {
    vertical_rotation: FloatProvider(),
    shape: ObjectNode({
      distance_factor: FloatProvider(),
      thickness: FloatProvider(),
      width_smoothness: NumberNode({ integer: true, min: 0 }),
      horizontal_radius_factor: FloatProvider(),
      vertical_radius_default_factor: NumberNode(),
      vertical_radius_center_factor: NumberNode()
    })
  }

  const CaveConfig: NodeChildren = {
    horizontal_radius_multiplier: FloatProvider(),
    vertical_radius_multiplier: FloatProvider(),
    floor_level: FloatProvider({ min: -1, max: 1 }),
  }

  schemas.register('configured_carver', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/carver' } }),
    config: ObjectNode({
      probability: NumberNode({ min: 0, max: 1 }),
      y: Reference('height_provider'),
      yScale: FloatProvider(),
      lava_level: Reference('vertical_anchor'),
      replaceable: Tag({ resource: 'block' }),
      debug_settings: Opt(ObjectNode({
        debug_mode: Opt(BooleanNode()),
        air_state: Opt(Reference('block_state')),
        water_state: Opt(Reference('block_state')),
        lava_state: Opt(Reference('block_state')),
        barrier_state: Opt(Reference('block_state'))
      })),
      [Switch]: ['pop', { push: 'type' }],
      [Case]: {
        'minecraft:canyon': CanyonConfig,
        'minecraft:cave': CaveConfig,
        'minecraft:nether_cave': CaveConfig
      },
    })
  }, { context: 'carver' }), {
    default: () => ({
      type: 'minecraft:cave',
      config: {
        probability: 0.1
      }
    })
  }))
}
