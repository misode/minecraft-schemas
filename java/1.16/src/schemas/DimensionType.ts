import {
  BooleanNode,
  EnumNode,
  Force,
  Mod,
  NumberNode,
  ObjectNode,
  SCHEMAS,
  ObjectOrPreset,
  INode,
  StringNode,
  Resource,
} from '@mcschema/core'

const defaultType = {
  ultrawarm: false,
  natural: true,
  shrunk: false,
  piglin_safe: false,
  respawn_anchor_works: false,
  bed_works: true,
  has_raids: true,
  has_skylight: true,
  has_ceiling: false,
  ambient_light: 0,
  logical_height: 256,
  infiniburn: 'minecraft:infiniburn_overworld',
}

SCHEMAS.register('dimension_type', Mod(ObjectNode({
  name: Mod(Force(Resource(StringNode())), {
    enabled: (path) => path.getArray().length > 0
  }),
  ultrawarm: Force(BooleanNode({ radio: true })),
  natural: Force(BooleanNode({ radio: true })),
  shrunk: Force(BooleanNode({ radio: true })),
  piglin_safe: Force(BooleanNode({ radio: true })),
  respawn_anchor_works: Force(BooleanNode({ radio: true })),
  bed_works: Force(BooleanNode({ radio: true })),
  has_raids: Force(BooleanNode({ radio: true })),
  has_skylight: Force(BooleanNode({ radio: true })),
  has_ceiling: Force(BooleanNode({ radio: true })),
  ambient_light: Force(NumberNode()),
  fixed_time: NumberNode({ integer: true }),
  logical_height: Force(NumberNode({ integer: true })),
  infiniburn: Force(EnumNode('dimension_type_infiniburn', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$tag/block' } } }))
}, { context: 'dimension_type' }), {
  default: () => defaultType
}))

export const DimensionTypePresets = (node: INode<any>) => ObjectOrPreset(
  EnumNode('dimension_type', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$dimension_type' } } }),
  node,
  {
    'minecraft:overworld': defaultType,
    'minecraft:the_nether': {
      ultrawarm: true,
      natural: false,
      shrunk: true,
      piglin_safe: true,
      respawn_anchor_works: true,
      bed_works: false,
      has_raids: false,
      has_skylight: false,
      has_ceiling: true,
      ambient_light: 0.1,
      fixed_time: 18000,
      logical_height: 128,
      infiniburn: 'minecraft:infiniburn_nether',
    },
    'minecraft:the_end': {
      ultrawarm: false,
      natural: false,
      shrunk: false,
      piglin_safe: false,
      respawn_anchor_works: false,
      bed_works: false,
      has_raids: true,
      has_skylight: false,
      has_ceiling: false,
      ambient_light: 0,
      fixed_time: 6000,
      logical_height: 256,
      infiniburn: 'minecraft:infiniburn_end',
    }
  }
)
