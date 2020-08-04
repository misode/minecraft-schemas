import {
  BooleanNode,
  ChoiceNode,
  COLLECTIONS,
  EnumNode,
  Force,
  INode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference,
  SCHEMAS,
  Resource,
  MapNode,
  ObjectOrPreset,
  StringNode,
} from '@mcschema/core'
import { BlockState, FluidState } from '../Common'

const defaultSettings = {
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

SCHEMAS.register('noise_settings', Mod(ObjectNode({
  name: Mod(Force(Resource(StringNode())), {
    enabled: (path) => path.getArray().length > 0
  }),
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
}), {
  default: () => defaultSettings
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
    EnumNode('worldgen/structure_feature', { search: true, additional: true }),
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
    block: 'minecraft:stone',
    height: 1
  })
}))

export const NoiseSettingsPresets = (node: INode<any>) => ObjectOrPreset(
  Resource(EnumNode('dimension_generator_setting_preset', { search: true, additional: true, validation: { validator: 'resource', params: { pool: COLLECTIONS.get('dimension_generator_setting_preset') } } })),
  node,
  {
    'minecraft:overworld': defaultSettings,
    'minecraft:nether': {
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
    },
    'minecraft:end': {
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
    },
    'minecraft:amplified': {
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
    },
    'minecraft:caves': {
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
    },
    'minecraft:floating_islands': {
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
  }
)
