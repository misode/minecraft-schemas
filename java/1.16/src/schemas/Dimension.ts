import {
  BooleanNode,
  Case,
  EnumNode,
  Force,
  ListNode,
  MapNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference,
  Resource,
  SCHEMAS,
  StringNode,
  Switch,
} from '@mcschema/core'
import { NoiseSettingsPresets } from './worldgen/NoiseSettings'
import { DimensionTypePresets } from './DimensionType'

SCHEMAS.register('dimension', Mod(ObjectNode({
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
              biome: EnumNode('worldgen/biome', { defaultValue: 'minecraft:plains', search: true, additional: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } })
            },
            'minecraft:multi_noise': {
              preset: EnumNode(['nether']),
              biomes: ListNode(
                Reference('generator_biome')
              )
            },
            'minecraft:checkerboard': {
              scale: NumberNode({ integer: true, min: 0, max: 62 }),
              biomes: ListNode(
                EnumNode('worldgen/biome', { defaultValue: 'minecraft:plains', search: true, additional: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } })
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
    type: 'minecraft:overworld'
  })
}))

SCHEMAS.register('generator_biome', Mod(ObjectNode({
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
