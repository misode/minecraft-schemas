import {
  BooleanNode,
  EnumNode as RawEnumNode,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Resource,
  SchemaRegistry,
  CollectionRegistry,
  MapNode,
  Mod,
} from '@mcschema/core'

export function initWorldSettingsSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('world_settings', Mod(ObjectNode({
    generate_features: BooleanNode({ radio: true }),
    bonus_chest: BooleanNode({ radio: true }),
    seed: NumberNode({ integer: true }),
    dimensions: MapNode(
      Resource(EnumNode('dimension', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$dimension' } } })),
      Reference('dimension')
    )
  }, { context: 'world_settings' }), {
    default: () => ({
      generate_features: true,
      bonus_chest: false,
      seed: 0,
      dimensions: {
        'minecraft:overworld': {
          type: "minecraft:overworld",
          generator: {
            biome_source: {
              seed: 0,
              large_biomes: false,
              type: 'minecraft:vanilla_layered'
            },
            seed: 0,
            settings: 'minecraft:overworld',
            type: 'minecraft:noise'
          }
        }
      }
    })
  }))
}
