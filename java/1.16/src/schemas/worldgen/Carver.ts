import {
  EnumNode,
  Force,
  Mod,
  NumberNode,
  ObjectNode,
  Resource,
  SCHEMAS,
} from '@mcschema/core'

SCHEMAS.register('configured_carver', Mod(ObjectNode({
  name: Force(Resource(EnumNode('worldgen/carver', 'minecraft:cave'))),
  config: ObjectNode({
    probability: NumberNode({ min: 0, max: 1 })
  })
}, { context: 'carver' }), {
  default: () => ({
    name: 'minecraft:cave',
    config: {
      probability: 0.1
    }
  })
}))
