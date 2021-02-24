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
import { FloatProvider, UniformInt } from '../Common'

export function initCarverSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('configured_carver', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/carver' } }),
    config: ObjectNode({
      probability: NumberNode({ min: 0, max: 1 }),
      debug_settings: Opt(ObjectNode({
        debug_mode: Opt(BooleanNode()),
        air_state: Opt(Reference('block_state'))
      })),
      [Switch]: ['pop', { push: 'type' }],
      [Case]: {
        'minecraft:canyon': {
          bottom_inclusive: Reference('vertical_anchor'),
          top_inclusive: Reference('vertical_anchor'),
          y_scale: UniformInt(),
          distanceFactor: FloatProvider({ min: 0, max: 1 }),
          vertical_rotation: FloatProvider(),
          thickness: FloatProvider(),
          width_smoothness: NumberNode({ integer: true, min: 0 }),
          horizontal_radius_factor: FloatProvider(),
          vertical_radius_default_factor: NumberNode(), 
          vertical_radius_center_factor: NumberNode(), 
        }
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
