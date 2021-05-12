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
} from '@mcschema/core'
import { DimensionTypePresets, NoiseSettingsPresets } from './Common'

export function initDimensionSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  const NoPreset = (node: INode) => Mod(node, {
    enabled: path => path.push('preset').get() === undefined
  })

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
                seed: NumberNode({ integer: true }),
                preset: Opt(StringNode({ enum: ['nether'] })),
                altitude_noise: NoPreset(Reference('generator_biome_noise')),
                temperature_noise: NoPreset(Reference('generator_biome_noise')),
                humidity_noise: NoPreset(Reference('generator_biome_noise')),
                weirdness_noise: NoPreset(Reference('generator_biome_noise')),
                biomes: NoPreset(Mod(ListNode(
                  Reference('generator_biome')
                ), {
                  default: () => [{
                    biome: 'minecraft:plains'
                  }]
                }))
              },
              'minecraft:checkerboard': {
                scale: Opt(NumberNode({ integer: true, min: 0, max: 62 })),
                biomes: ListNode(
                  StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } })
                )
              },
              'minecraft:the_end': {
                seed: NumberNode({ integer: true })
              },
              'minecraft:vanilla_layered': {
                seed: NumberNode({ integer: true }),
                large_biomes: Opt(BooleanNode()),
                legacy_biome_init_layer: Opt(BooleanNode())
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

  schemas.register('generator_biome', Mod(ObjectNode({
    biome: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } }),
    parameters: ObjectNode({
      altitude: NumberNode(),
      temperature: NumberNode(),
      humidity: NumberNode(),
      weirdness: NumberNode(),
      offset: NumberNode()
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

  schemas.register('generator_biome_noise',Mod(ObjectNode({
    firstOctave: NumberNode({ integer: true }),
    amplitudes: ListNode(
      NumberNode()
    )
  }, { context: 'generator_biome_noise' }), {
    default: () => ({
      firstOctave: -7,
      amplitudes: [1, 1]
    })
  }))
}
