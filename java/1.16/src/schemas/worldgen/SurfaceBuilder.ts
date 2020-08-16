import {
  EnumNode as RawEnumNode,
  Mod,
  ObjectNode,
  Reference as RawReference,
  Resource,
  SchemaRegistry,
  CollectionRegistry,
} from '@mcschema/core'

export function initSurfaceBuilderSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const EnumNode = RawEnumNode.bind(undefined, collections)
  const Reference = RawReference.bind(undefined, schemas)

  schemas.register('configured_surface_builder', Mod(ObjectNode({
    type: Resource(EnumNode('worldgen/surface_builder')),
    config: ObjectNode({
      top_material: Reference('block_state'),
      under_material: Reference('block_state'),
      underwater_material: Reference('block_state'),
    }, { context: 'surface_builder' })
  }, { context: 'surface_builder' }), {
    default: () => ({
      type: 'minecraft:default',
      config: {
        top_material: {
          Name: 'minecraft:grass_block',
          Properties: {
            snowy: 'false'
          }
        },
        under_material: {
          Name: 'minecraft:dirt'
        },
        underwater_material: {
          Name: 'minecraft:gravel'
        }
      }
    })
  }))
}
