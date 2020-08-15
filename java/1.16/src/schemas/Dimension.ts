import {
  BooleanNode,
  Case,
  EnumNode as RawEnumNode,
  Force,
  ListNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Resource,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'
import { DimensionTypePresets, NoiseSettingsPresets } from './Common'

export function initDimensionSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('dimension', Mod(ObjectNode({
    type: DimensionTypePresets(Reference('dimension_type')),
    generator: ObjectNode({
      type: Resource(EnumNode('worldgen/chunk_generator', { defaultValue: 'minecraft:noise', validation: { validator: 'resource', params: { pool: 'minecraft:worldgen/chunk_generator' } } })),
      seed: NumberNode({ integer: true }),
      [Switch]: path => path.push('type'),
      [Case]: {
        'minecraft:noise': {
          biome_source: ObjectNode({
            type: Resource(EnumNode('worldgen/biome_source', { defaultValue: 'minecraft:multi_noise', validation: { validator: 'resource', params: { pool: 'minecraft:worldgen/biome_source' } } })),
            seed: NumberNode({ integer: true }),
            [Switch]: path => path.push('type'),
            [Case]: {
              'minecraft:fixed': {
                biome: Resource(EnumNode('worldgen/biome', { defaultValue: 'minecraft:plains', search: true, additional: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } }))
              },
              'minecraft:multi_noise': {
                preset: Opt(EnumNode(['nether'])),
                altitude_noise: Opt(Reference('generator_biome_noise')),
                temperature_noise: Opt(Reference('generator_biome_noise')),
                humidity_noise: Opt(Reference('generator_biome_noise')),
                weirdness_noise: Opt(Reference('generator_biome_noise')),
                biomes: Opt(ListNode(
                  Reference('generator_biome')
                ))
              },
              'minecraft:checkerboard': {
                scale: Opt(NumberNode({ integer: true, min: 0, max: 62 })),
                biomes: ListNode(
                  Resource(EnumNode('worldgen/biome', { defaultValue: 'minecraft:plains', search: true, additional: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } }))
                )
              },
              'minecraft:vanilla_layered': {
                large_biomes: Opt(BooleanNode()),
                legacy_biome_init_layer: Opt(BooleanNode())
              }
            }
          }, { category: 'predicate', disableSwitchContext: true }),
          settings: NoiseSettingsPresets(Reference('noise_settings'))
        },
        'minecraft:flat': {
          settings: ObjectNode({
            biome: Opt(Resource(EnumNode('worldgen/biome', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } }))),
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
  }, { context: 'dimension' }), {
    default: () => ({
      type: 'minecraft:overworld',
      generator: {
        biome_source: {
          altitude_noise: {
            firstOctave: -7,
            amplitudes: [1, 1]
          },
          temperature_noise: {
            firstOctave: -7,
            amplitudes: [1, 1]
          },
          humidity_noise: {
            firstOctave: -7,
            amplitudes: [1, 1]
          },
          weirdness_noise: {
            firstOctave: -7,
            amplitudes: [1, 1]
          }
        },
        settings: 'minecraft:overworld'
      }
    })
  }))

  schemas.register('generator_biome', Mod(ObjectNode({
    biome: Resource(EnumNode('worldgen/biome', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } })),
    parameters: ObjectNode({
      altitude: NumberNode({ min: -1, max: 1 }),
      temperature: NumberNode({ min: -1, max: 1 }),
      humidity: NumberNode({ min: -1, max: 1 }),
      weirdness: NumberNode({ min: -1, max: 1 }),
      offset: NumberNode({ min: -1, max: 1 })
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

  schemas.register('generator_biome_noise', ObjectNode({
    firstOctave: NumberNode({ integer: true }),
    amplitudes: ListNode(
      NumberNode()
    )
  }, { context: 'generator_biome_noise' }))
}
