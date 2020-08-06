import {
  BooleanNode,
  EnumNode as RawEnumNode,
  Force,
  Mod,
  NumberNode,
  ObjectNode,
  StringNode,
  Resource,
  SchemaRegistry,
  CollectionRegistry,
} from '@mcschema/core'
import { DefaultDimensionType } from './Common'

export function initDimensionTypeSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('dimension_type', Mod(ObjectNode({
    name: Mod(Force(Resource(StringNode())), {
      enabled: (path) => path.getArray().length > 0
    }),
    ultrawarm: Force(BooleanNode({ radio: true })),
    natural: Force(BooleanNode({ radio: true })),
    piglin_safe: Force(BooleanNode({ radio: true })),
    respawn_anchor_works: Force(BooleanNode({ radio: true })),
    bed_works: Force(BooleanNode({ radio: true })),
    has_raids: Force(BooleanNode({ radio: true })),
    has_skylight: Force(BooleanNode({ radio: true })),
    has_ceiling: Force(BooleanNode({ radio: true })),
    coordinate_scale: Force(NumberNode({ min: 0.00001, max: 30000000 })),
    ambient_light: Force(NumberNode()),
    fixed_time: NumberNode({ integer: true }),
    logical_height: Force(NumberNode({ integer: true })),
    infiniburn: Force(Resource(EnumNode('dimension_type_infiniburn', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$tag/block' } } })))
  }, { context: 'dimension_type' }), {
    default: () => DefaultDimensionType
  }))
}
