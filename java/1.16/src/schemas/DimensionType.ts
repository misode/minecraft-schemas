import {
  BooleanNode,
  EnumNode as RawEnumNode,
  Mod,
  NumberNode,
  ObjectNode,
  StringNode,
  Resource,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'
import { DefaultDimensionType } from './Common'

export function initDimensionTypeSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('dimension_type', Mod(ObjectNode({
    name: Mod(Resource(StringNode()), {
      enabled: (path) => path.getArray().length > 0
    }),
    ultrawarm: BooleanNode({ radio: true }),
    natural: BooleanNode({ radio: true }),
    piglin_safe: BooleanNode({ radio: true }),
    respawn_anchor_works: BooleanNode({ radio: true }),
    bed_works: BooleanNode({ radio: true }),
    has_raids: BooleanNode({ radio: true }),
    has_skylight: BooleanNode({ radio: true }),
    has_ceiling: BooleanNode({ radio: true }),
    coordinate_scale: NumberNode({ min: 0.00001, max: 30000000 }),
    ambient_light: NumberNode(),
    fixed_time: Opt(NumberNode({ integer: true })),
    logical_height: NumberNode({ integer: true, min: 0, max: 256 }),
    effects: Opt(Resource(EnumNode(['minecraft:overworld', 'minecraft:the_nether', 'minecraft:the_end']))),
    infiniburn: Resource(EnumNode('dimension_type_infiniburn', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$tag/block' } } }))
  }, { context: 'dimension_type' }), {
    default: () => DefaultDimensionType
  }))
}
