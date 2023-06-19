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
import { NoiseSettingsPresets, Tag } from './Common'

export function initDimensionSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('dimension', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: '$dimension_type' } }),
    generator: ObjectNode({
      type: StringNode({ validator: 'resource', params: { pool: 'worldgen/chunk_generator' } }),
      [Switch]: [{ push: 'type' }],
      [Case]: {
        'minecraft:noise': {
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
                biomes: Tag({ resource: '$worldgen/biome' })
              },
            }
          }, { category: 'predicate', disableSwitchContext: true })
        },
        'minecraft:flat': {
          settings: Reference('flat_generator_settings')
        }
      }
    }, { disableSwitchContext: true })
  }, { category: 'pool', context: 'dimension' }), {
    default: () => {
      return {
      type: 'minecraft:overworld',
      generator: {
        type: 'minecraft:noise',
        biome_source: {
          type: 'minecraft:fixed',
          biome: 'minecraft:plains'
        },
        settings: 'minecraft:overworld'
      }
    }}
  }))

  schemas.register('flat_generator_settings', ObjectNode({
    biome: Opt(StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } })),
    lakes: Opt(BooleanNode()),
    features: Opt(BooleanNode()),
    layers: ListNode(
      Reference('generator_layer')
    ),
    structure_overrides: Tag({ resource: '$worldgen/structure_set' })
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

  schemas.register('parameter_point', ObjectNode({
    temperature: ClimateParameter,
    humidity: ClimateParameter,
    continentalness: ClimateParameter,
    erosion: ClimateParameter,
    weirdness: ClimateParameter,
    depth: ClimateParameter,
    offset: NumberNode({ min: 0, max: 1 })
  }))

  schemas.register('generator_biome', Mod(ObjectNode({
    biome: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } }),
    parameters: Reference('parameter_point'),
  }, { context: 'generator_biome' }), {
    default: () => ({
      biome: 'minecraft:plains',
      parameters: {
        temperature: 0,
        humidity: 0,
        continentalness: 0,
        erosion: 0,
        weirdness: 0,
        depth: 0,
        offset: 0
      }
    })
  }))
}
