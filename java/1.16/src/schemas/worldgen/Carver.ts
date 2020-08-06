import {
  EnumNode as RawEnumNode,
  Force,
  Mod,
  NumberNode,
  ObjectNode,
  Resource,
  SchemaRegistry,
  CollectionRegistry,
} from '@mcschema/core'

export function initCarverSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('configured_carver', Mod(ObjectNode({
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
}
