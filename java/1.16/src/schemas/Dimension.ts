import {
  BooleanNode,
  Case,
  ChoiceNode,
  EnumNode,
  Force,
  INode,
  ListNode,
  MapNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference,
  Resource,
  SCHEMAS,
  Switch,
  COLLECTIONS,
} from '@mcschema/core'
import { BlockState, FluidState } from './Common'

const SettingsPresets = (node: INode<any>) => ChoiceNode([
  [
    'string',
    EnumNode('dimension_generator_setting_preset', { defaultValue: 'minecraft:overworld', validation: { validator: 'resource', params: { pool: COLLECTIONS.get('dimension_generator_setting_preset') } } }),
    _ => 'minecraft:overworld'
  ],
  [
    'object',
    node,
    v => {
      switch (v) {
        case 'minecraft:nether':
          return {
            bedrock_roof_position: 0,
            bedrock_floor_position: 0,
            sea_level: 32,
            disable_mob_generation: true,
            noise: {
              density_factor: 0,
              density_offset: 0.019921875,
              simplex_surface_noise: false,
              random_density_offset: false,
              island_noise_override: false,
              amplified: false,
              size_horizontal: 1,
              size_vertical: 2,
              height: 128,
              sampling: {
                xz_scale: 1,
                y_scale: 3,
                xz_factor: 80,
                y_factor: 60
              },
              top_slide: {
                target: 120,
                size: 3,
                offset: 0
              },
              bottom_slide: {
                target: 320,
                size: 4,
                offset: -1
              }
            },
            default_block: {
              Name: "minecraft:netherrack"
            },
            default_fluid: {
              Name: "minecraft:lava",
              Properties: {
                level: "0"
              }
            }
          }
        case 'minecraft:end':
          return {
            bedrock_roof_position: -10,
            bedrock_floor_position: -10,
            sea_level: 0,
            disable_mob_generation: true,
            noise: {
              density_factor: 0,
              density_offset: 0,
              simplex_surface_noise: true,
              random_density_offset: false,
              island_noise_override: true,
              amplified: false,
              size_horizontal: 2,
              size_vertical: 1,
              height: 128,
              sampling: {
                xz_scale: 2,
                y_scale: 1,
                xz_factor: 80,
                y_factor: 160
              },
              top_slide: {
                target: -3000,
                size: 64,
                offset: -46
              },
              bottom_slide: {
                target: -30,
                size: 7,
                offset: 1
              }
            },
            default_block: {
              Name: "minecraft:end_stone"
            },
            default_fluid: {
              Name: "minecraft:air"
            }
          }
        case 'minecraft:amplified':
          return {
            bedrock_roof_position: -10,
            bedrock_floor_position: 0,
            sea_level: 63,
            disable_mob_generation: false,
            noise: {
              density_factor: 1,
              density_offset: -0.46875,
              simplex_surface_noise: true,
              random_density_offset: true,
              island_noise_override: false,
              amplified: true,
              size_horizontal: 1,
              size_vertical: 2,
              height: 256,
              sampling: {
                xz_scale: 1,
                y_scale: 1,
                xz_factor: 80,
                y_factor: 160
              },
              top_slide: {
                target: -10,
                size: 3,
                offset: 0
              },
              bottom_slide: {
                target: -30,
                size: 0,
                offset: 0
              }
            },
            default_block: {
              Name: "minecraft:stone"
            },
            default_fluid: {
              Name: "minecraft:water",
              Properties: {
                level: "0"
              }
            }
          }
        case 'minecraft:caves':
          return {
            bedrock_roof_position: 0,
            bedrock_floor_position: 0,
            sea_level: 32,
            disable_mob_generation: true,
            noise: {
              density_factor: 0,
              density_offset: 0.019921875,
              simplex_surface_noise: false,
              random_density_offset: false,
              island_noise_override: false,
              amplified: false,
              size_horizontal: 1,
              size_vertical: 2,
              height: 128,
              sampling: {
                xz_scale: 1,
                y_scale: 3,
                xz_factor: 80,
                y_factor: 60
              },
              top_slide: {
                target: 120,
                size: 3,
                offset: 0
              },
              bottom_slide: {
                target: 320,
                size: 4,
                offset: -1
              }
            },
            default_block: {
              Name: "minecraft:stone"
            },
            default_fluid: {
              Name: "minecraft:water",
              Properties: {
                level: "0"
              }
            }
          }
        case 'minecraft:floating_islands':
          return {
            bedrock_roof_position: -10,
            bedrock_floor_position: -10,
            sea_level: 0,
            disable_mob_generation: true,
            noise: {
              density_factor: 0,
              density_offset: 0,
              simplex_surface_noise: true,
              random_density_offset: false,
              island_noise_override: true,
              amplified: false,
              size_horizontal: 2,
              size_vertical: 1,
              height: 128,
              sampling: {
                xz_scale: 2,
                y_scale: 1,
                xz_factor: 80,
                y_factor: 160
              },
              top_slide: {
                target: -3000,
                size: 64,
                offset: -46
              },
              bottom_slide: {
                target: -30,
                size: 7,
                offset: 1
              }
            },
            default_block: {
              Name: "minecraft:stone"
            },
            default_fluid: {
              Name: "minecraft:water",
              Properties: {
                level: "0"
              }
            }
          }
        case 'minecraft:overworld':
        default:
          return {
            bedrock_roof_position: -10,
            bedrock_floor_position: 0,
            sea_level: 63,
            disable_mob_generation: false,
            noise: {
              density_factor: 1,
              density_offset: -0.46875,
              simplex_surface_noise: true,
              random_density_offset: true,
              island_noise_override: false,
              amplified: false,
              size_horizontal: 1,
              size_vertical: 2,
              height: 256,
              sampling: {
                xz_scale: 1,
                y_scale: 1,
                xz_factor: 80,
                y_factor: 160
              },
              top_slide: {
                target: -10,
                size: 3,
                offset: 0
              },
              bottom_slide: {
                target: -30,
                size: 0,
                offset: 0
              }
            },
            default_block: {
              Name: "minecraft:stone"
            },
            default_fluid: {
              Name: "minecraft:water",
              Properties: {
                level: "0"
              }
            }
          }
      }
    }
  ]
])

SCHEMAS.register('dimension', Mod(ObjectNode({
  type: Force(EnumNode('dimension_type', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$dimension' } } })),
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
              biome: EnumNode('worldgen/biome', { defaultValue: 'minecraft:plains', validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } })
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
                EnumNode('worldgen/biome', { defaultValue: 'minecraft:plains', validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } })
              )
            },
            'minecraft:vanilla_layered': {
              large_biomes: BooleanNode(),
              legacy_biome_init_layer: BooleanNode()
            }
          }
        }, { category: 'predicate', disableSwitchContext: true })),
        settings: Force(SettingsPresets(ObjectNode({
          bedrock_roof_position: Force(NumberNode({ integer: true })),
          bedrock_floor_position: Force(NumberNode({ integer: true })),
          sea_level: Force(NumberNode({ integer: true })),
          disable_mob_generation: Force(BooleanNode()),
          default_block: Force(BlockState),
          default_fluid: Force(FluidState),
          noise: Force(ObjectNode({
            density_factor: Force(NumberNode()),
            density_offset: Force(NumberNode()),
            simplex_surface_noise: Force(BooleanNode()),
            random_density_offset: Force(BooleanNode()),
            island_noise_override: Force(BooleanNode()),
            amplified: Force(BooleanNode()),
            size_horizontal: Force(NumberNode({ integer: true })),
            size_vertical: Force(NumberNode({ integer: true })),
            height: Force(NumberNode({ integer: true })),
            sampling: Force(ObjectNode({
              xz_scale: Force(NumberNode()),
              y_scale: Force(NumberNode()),
              xz_factor: Force(NumberNode()),
              y_factor: Force(NumberNode())
            })),
            bottom_slide: Force(ObjectNode({
              target: Force(NumberNode({ integer: true })),
              size: Force(NumberNode({ integer: true })),
              offset: Force(NumberNode({ integer: true }))
            })),
            top_slide: Force(ObjectNode({
              target: Force(NumberNode({ integer: true })),
              size: Force(NumberNode({ integer: true })),
              offset: Force(NumberNode({ integer: true }))
            }))
          })),
          structures: Reference('generator_structures')
        })))
      },
      'minecraft:flat': {
        settings: ObjectNode({
          biome: Resource(EnumNode('worldgen/biome', { validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } })),
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
  biome: Force(Resource(EnumNode('worldgen/biome', { search: true, validation: { validator: 'resource', params: { pool: '$worldgen/biome' } } }))),
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

SCHEMAS.register('generator_structures', ObjectNode({
  stronghold: ObjectNode({
    distance: NumberNode({ integer: true }),
    spread: NumberNode({ integer: true }),
    count: NumberNode({ integer: true })
  }, {
    collapse: true
  }),
  structures: MapNode(
    EnumNode('worldgen/feature', { validation: { validator: 'resource', params: { pool: '$worldgen/feature' } } }),
    Mod(ObjectNode({
      spacing: NumberNode({ integer: true, min: 2, max: 4096 }),
      separation: NumberNode({ integer: true, min: 1, max: 4096 }),
      salt: NumberNode({ integer: true })
    }, { context: 'generator_structure' }), {
      default: () => ({
        spacing: 10,
        separation: 5,
        salt: 0
      })
    })
  )
}))

SCHEMAS.register('generator_layer', Mod(ObjectNode({
  block: Force(Resource(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } }))),
  height: Force(NumberNode({ integer: true, min: 1 }))
}), {
  default: () => ({
    block: 'stone',
    height: 1
  })
}))

SCHEMAS.register('dimension_type', Mod(ObjectNode({
  ultrawarm: Force(BooleanNode({ radio: true })),
  natural: Force(BooleanNode({ radio: true })),
  shrunk: Force(BooleanNode({ radio: true })),
  piglin_safe: Force(BooleanNode({ radio: true })),
  respawn_anchor_works: Force(BooleanNode({ radio: true })),
  bed_works: Force(BooleanNode({ radio: true })),
  has_raids: Force(BooleanNode({ radio: true })),
  has_skylight: Force(BooleanNode({ radio: true })),
  has_ceiling: Force(BooleanNode({ radio: true })),
  ambient_light: Force(NumberNode()),
  fixed_time: NumberNode({ integer: true }),
  logical_height: Force(NumberNode({ integer: true })),
  infiniburn: Force(EnumNode('dimension_type_infiniburn', { search: true, additional: true, validation: { validator: 'resource', params: { pool: '$tag/block' } } }))
}, { context: 'dimension_type' }), {
  default: () => ({
    ultrawarm: false,
    natural: true,
    shrunk: false,
    piglin_safe: false,
    respawn_anchor_works: false,
    bed_works: false,
    has_raids: false,
    has_skylight: true,
    has_ceiling: false,
    ambient_light: 0,
    logical_height: 256,
    infiniburn: 'minecraft:infiniburn_overworld',
  })
}))
