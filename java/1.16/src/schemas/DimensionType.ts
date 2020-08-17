import {
  BooleanNode,
  StringNode as RawStringNode,
  Mod,
  NumberNode,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'
import { DefaultDimensionType } from './Common'

export function initDimensionTypeSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('dimension_type', Mod(ObjectNode({
    name: Mod(StringNode({ validator: 'resource', params: { pool: '$dimension_type', isDefinition: true }}), {
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
    effects: Opt(StringNode({ enum: ['minecraft:overworld', 'minecraft:the_nether', 'minecraft:the_end'] })),
    infiniburn: StringNode({ validator: 'resource', params: { pool: '$tag/block' } })
  }, { context: 'dimension_type' }), {
    default: () => DefaultDimensionType
  }))
}
