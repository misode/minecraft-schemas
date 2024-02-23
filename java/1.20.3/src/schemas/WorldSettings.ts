import {
  BooleanNode,
  StringNode as RawStringNode,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  SchemaRegistry,
  CollectionRegistry,
  MapNode,
  Mod,
} from '@mcschema/core'

export function initWorldSettingsSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('world_settings', Mod(ObjectNode({
    generate_features: BooleanNode(),
    bonus_chest: BooleanNode(),
    seed: NumberNode({ integer: true }),
    dimensions: MapNode(
      StringNode({ validator: 'resource', params: { pool: '$dimension' } }),
      Reference('dimension')
    )
  }, { context: 'world_settings' }), {
    default: () => {
      const seed = Math.floor(Math.random() * (4294967296)) - 2147483648
      return {
        generate_features: true,
        bonus_chest: false,
        seed,
        dimensions: {
          'minecraft:overworld': {
            type: 'minecraft:overworld',
            generator: {
              type: 'minecraft:noise',
              seed,
              biome_source: {
                type: 'minecraft:multi_noise',
                preset: "minecraft:overworld"
              },
              settings: 'minecraft:overworld',
            }
          },
          'minecraft:the_nether': {
            type: 'minecraft:the_nether',
            generator: {
              type: 'minecraft:noise',
              seed,
              biome_source: {
                type: 'minecraft:multi_noise',
                preset: "minecraft:nether"
              },
              settings: 'minecraft:nether'
            }
          },
          'minecraft:the_end': {
            type: "minecraft:the_end",
            generator: {
              type: "minecraft:noise",
              seed,
              biome_source: {
                type: "minecraft:the_end",
                seed
              },
              settings: "minecraft:end"
            }
          }
        }
      }
    }
  }))
}
