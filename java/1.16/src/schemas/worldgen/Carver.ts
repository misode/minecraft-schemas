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
  type: Force(Resource(EnumNode('worldgen/carver', 'minecraft:cave'))),
  config: Force(ObjectNode({
    probability: Force(NumberNode({ min: 0, max: 1 }))
  }))
}, { context: 'carver' }), {
  default: () => ({
    type: 'minecraft:cave',
    config: {
      probability: 0.1
    }
  })
}))
