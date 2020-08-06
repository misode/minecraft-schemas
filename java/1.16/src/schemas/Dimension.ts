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
} from '@mcschema/core'
import { DimensionTypePresets, NoiseSettingsPresets } from './Common'

export function initDimensionSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('dimension', Mod(ObjectNode({
    type: Force(DimensionTypePresets(Reference('dimension_type'))),
    generator: Force(ObjectNode({
      type: Resource(EnumNode('worldgen/chunk_generator', { defaultValue: 'minecraft:noise', validation: { validator: 'resource', params: { pool: 'minecraft:worldgen/chunk_generator' } } })),
      seed: NumberNode({ integer: true }),
      [Switch]: path => path.push('type'),
      [Case]: {
        'minecraft:noise': {
          biome_source: Force(ObjectNode({
            type: Resource(EnumNode('worldgen/biome_source', { defaultValue: 'minecraft:multi_noise', validation: { validator: 'resource', params: { pool: 'minecraft:worldgen/biome_source' } } })),
            seed: NumberNode({ integer: true }),
            [Switch]: path => path.push('type'),
            [Case]: {
              'minecraft:fixed': {
                biome: Resource(EnumNode('worldgen/biome', { defaultValue: 'minecraft:plains', search: true, additional: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } }))
              },
              'minecraft:multi_noise': {
                preset: EnumNode(['nether']),
                altitude_noise: Reference('generator_biome_noise'),
                temperature_noise: Reference('generator_biome_noise'),
                humidity_noise: Reference('generator_biome_noise'),
                weirdness_noise: Reference('generator_biome_noise'),
                biomes: ListNode(
                  Reference('generator_biome')
                )
              },
              'minecraft:checkerboard': {
                scale: NumberNode({ integer: true, min: 0, max: 62 }),
                biomes: ListNode(
                  Resource(EnumNode('worldgen/biome', { defaultValue: 'minecraft:plains', search: true, additional: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } }))
                )
              },
              'minecraft:vanilla_layered': {
                large_biomes: BooleanNode(),
                legacy_biome_init_layer: BooleanNode()
              }
            }
          }, { category: 'predicate', disableSwitchContext: true })),
          settings: Force(NoiseSettingsPresets(Reference('noise_settings')))
        },
        'minecraft:flat': {
          settings: ObjectNode({
            biome: Resource(EnumNode('worldgen/biome', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } })),
            lakes: BooleanNode(),
            features: BooleanNode(),
            layers: Force(ListNode(
              Reference('generator_layer')
            )),
            structures: Reference('generator_structures')
          })
        }
      }
    }, { disableSwitchContext: true }))
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
        }
      }
    })
  }))

  schemas.register('generator_biome', Mod(ObjectNode({
    biome: Force(Resource(EnumNode('worldgen/biome', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } }))),
    parameters: ObjectNode({
      altitude: Force(NumberNode({ min: -1, max: 1 })),
      temperature: Force(NumberNode({ min: -1, max: 1 })),
      humidity: Force(NumberNode({ min: -1, max: 1 })),
      weirdness: Force(NumberNode({ min: -1, max: 1 })),
      offset: Force(NumberNode({ min: -1, max: 1 }))
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

  schemas.register('generator_biome_noise', Force(ObjectNode({
    firstOctave: Force(NumberNode({ integer: true })),
    amplitudes: Force(ListNode(
      NumberNode()
    ))
  })))
}
