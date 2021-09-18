import {
  BooleanNode,
  Case,
  StringNode as RawStringNode,
  ListNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
  INode,
  ChoiceNode,
} from '@mcschema/core'
import { DimensionTypePresets, NoiseSettingsPresets } from './Common'

export function initDimensionSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('dimension', Mod(ObjectNode({
    type: DimensionTypePresets(Reference('dimension_type')),
    generator: ObjectNode({
      type: StringNode({ validator: 'resource', params: { pool: 'worldgen/chunk_generator' } }),
      [Switch]: [{ push: 'type' }],
      [Case]: {
        'minecraft:noise': {
          seed: NumberNode({ integer: true }),
          settings: NoiseSettingsPresets(Reference('noise_settings')),
          biome_source: ObjectNode({
            type: StringNode({ validator: 'resource', params: { pool: 'worldgen/biome_source' } }),
            [Switch]: [{ push: 'type' }],
            [Case]: {
              'minecraft:fixed': {
                biome: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } })
              },
              'minecraft:multi_noise': {
                preset: Opt(StringNode({ validator: 'resource', params: { pool: ['minecraft:overworld', 'minecraft:nether'] } })),
                biomes: Mod(ListNode(
                  Reference('generator_biome')
                ), {
                  enabled: path => path.push('preset').get() === undefined,
                  default: () => [{
                    biome: 'minecraft:plains'
                  }]
                })
              },
              'minecraft:checkerboard': {
                scale: Opt(NumberNode({ integer: true, min: 0, max: 62 })),
                biomes: ListNode(
                  StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } })
                )
              },
              'minecraft:the_end': {
                seed: NumberNode({ integer: true })
              }
            }
          }, { category: 'predicate', disableSwitchContext: true })
        },
        'minecraft:flat': {
          settings: ObjectNode({
            biome: Opt(StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } })),
            lakes: Opt(BooleanNode()),
            features: Opt(BooleanNode()),
            layers: ListNode(
              Reference('generator_layer')
            ),
            structures: Reference('generator_structures')
          })
        }
      }
    }, { disableSwitchContext: true })
  }, { category: 'pool', context: 'dimension' }), {
    default: () => {
      const seed = Math.floor(Math.random() * (4294967296)) - 2147483648
      return {
      type: 'minecraft:overworld',
      generator: {
        type: 'minecraft:noise',
        seed,
        biome_source: {
          type: 'minecraft:fixed',
          seed,
          biome: 'minecraft:plains'
        },
        settings: 'minecraft:overworld'
      }
    }}
  }))

  const ClimateParameter = ChoiceNode([
    {
      type: 'number',
      node: NumberNode({ min: -2, max: 2 }),
      change: (v: any) => v[0] ?? 0
    },
    {
      type: 'list',
      node: ListNode(
        NumberNode({ min: -2, max: 2 }),
        { minLength: 2, maxLength: 2 },
      ),
      change: (v: any) => [v ?? 0, v ?? 0]
    }
  ])

  schemas.register('generator_biome', Mod(ObjectNode({
    biome: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } }),
    parameters: ObjectNode({
      temperature: ClimateParameter,
      humidity: ClimateParameter,
      continentalness: ClimateParameter,
      erosion: ClimateParameter,
      weirdness: ClimateParameter,
      depth: ClimateParameter,
      offset: NumberNode({ min: 0, max: 1 })
    })
  }, { context: 'generator_biome' }), {
    default: () => ({
      biome: 'minecraft:plains',
      parameters: {
        altitude: 0,
        temperature: 0,
        humidity: 0,
        weirdness: 0,
        offset: 0
      }
    })
  }))
}
