import {
  StringNode as RawStringNode,
  Reference as RawReference,
  Mod,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  MapNode,
} from '@mcschema/core'

export function initWorldPresetSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)
  const Reference = RawReference.bind(undefined, schemas)

  schemas.register('world_preset', Mod(ObjectNode({
    dimensions: MapNode(
			StringNode({ validator: 'resource', params: { pool: '$dimension', isDefinition: true } }),
			Reference('dimension'),
		)
  }, { context: 'world_preset' }), {
    default: () => ({
      dimensions: {
        'minecraft:overworld': {
          type: 'minecraft:overworld',
          generator: {
						type: 'minecraft:noise',
            biome_source: {
              type: 'minecraft:multi_noise',
              preset: 'minecraft:overworld',
            },
            settings: 'minecraft:overworld',
          },
        },
        'minecraft:the_nether': {
          type: 'minecraft:the_nether',
          generator: {
						type: 'minecraft:noise',
            biome_source: {
              type: 'minecraft:multi_noise',
              preset: 'minecraft:nether',
            },
            settings: 'minecraft:nether',
          },
        },
        'minecraft:the_end': {
          type: 'minecraft:the_end',
          generator: {
						type: 'minecraft:noise',
            biome_source: {
              type: 'minecraft:the_end',
            },
            settings: 'minecraft:end',
          },
        },
      }
    })
  }))

	schemas.register('flat_level_generator_preset', Mod(ObjectNode({
		display: StringNode({ validator: 'resource', params: { pool: 'item' } }),
		settings: Reference('flat_generator_settings'),
	}), {
		default: () => ({
			display: 'minecraft:grass_block',
			settings: {
				lakes: false,
				features: false,
				biome: 'minecraft:plains',
				structure_overrides: [],
				layers: [
					{
						height: 3,
						block: 'minecraft:dirt'
					},
					{
						height: 1,
						block: 'minecraft:grass_block'
					}
				]
			}
		})
	}))
}
