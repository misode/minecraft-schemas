import { Mod, Force } from '../../nodes/Node';
import { EnumNode } from '../../nodes/EnumNode';
import { Resource } from '../nodes/Resource';
import { NumberNode } from '../../nodes/NumberNode';
import { BooleanNode } from '../../nodes/BooleanNode';
import { ObjectNode, Switch, Case } from '../../nodes/ObjectNode';
import { ListNode } from '../../nodes/ListNode';
import { MapNode } from '../../nodes/MapNode';
import { StringNode } from '../../nodes/StringNode';
import { Reference } from '../../nodes/Reference';
import { SCHEMAS } from '../../Registries';

SCHEMAS.register('dimension', ObjectNode({
  type: Force(StringNode()),
  generator: Force(ObjectNode({
    type: Resource(EnumNode(['minecraft:noise', 'minecraft:flat', 'minecraft:debug'], 'minecraft:noise')),
    seed: Force(NumberNode({ integer: true })),
    [Switch]: path => path.push('type'),
    [Case]: {
      'minecraft:noise': {
        biome_source: Force(ObjectNode({
          type: Resource(EnumNode('biome_source', 'minecraft:multi_noise')),
          seed: Force(NumberNode({ integer: true })),
          [Switch]: path => path.push('type'),
          [Case]: {
            'minecraft:fixed': {
              biome: EnumNode('biome', 'minecraft:plains')
            },
            'minecraft:multi_noise': {
              preset: EnumNode(['nether']),
              biomes: Force(ListNode(
                Reference('generator-biome')
              ))
            },
            'minecraft:checkerboard': {
              biomes: ListNode(
                EnumNode('biome', 'minecraft:plains')
              )
            },
            'minecraft:vanilla_layered': {
              large_biomes: BooleanNode()
            }
          }
        }, {
          category: 'predicate'
        })),
        settings: ObjectNode({
          bedrock_roof_position: NumberNode({ integer: true }),
          bedrock_floor_position: NumberNode({ integer: true }),
          sea_level: NumberNode({ integer: true }),
          disable_mob_generation: BooleanNode(),
          default_block: ObjectNode({
            Name: StringNode(),
            Properties: MapNode(
              StringNode(),
              StringNode()
            )
          }),
          default_fluid: ObjectNode({
            Name: StringNode(),
            Properties: MapNode(
              StringNode(),
              {...StringNode(), default: () => ""}
            )
          }),
          noise: ObjectNode({
            density_factor: NumberNode(),
            density_offset: NumberNode(),
            simplex_surface_noise: BooleanNode(),
            random_density_offset: BooleanNode(),
            island_noise_override: BooleanNode(),
            amplified: BooleanNode(),
            size_horizontal: NumberNode({ integer: true }),
            size_vertical: NumberNode({ integer: true }),
            height: NumberNode({ integer: true }),
            sampling: ObjectNode({
              xz_scale: NumberNode(),
              y_scale: NumberNode(),
              xz_factor: NumberNode(),
              y_factor: NumberNode()
            }),
            bottom_slide: ObjectNode({
              target: NumberNode({ integer: true }),
              size: NumberNode({ integer: true }),
              offset: NumberNode({ integer: true })
            }),
            top_slide: ObjectNode({
              target: NumberNode({ integer: true }),
              size: NumberNode({ integer: true }),
              offset: NumberNode({ integer: true })
            })
          }, { collapse: true }),
          structures: Reference('generator-structures')
        }, { collapse: true })
      },
      'minecraft:flat': {
        settings: ObjectNode({
          biome: EnumNode('biome'),
          layers: Force(ListNode(
            Reference('generator-layer')
          )),
          structures: Reference('generator-structures')
        }, { collapse: true })
      }
    }
  }))
}))

SCHEMAS.register('generator-biome', Mod(ObjectNode({
  biome: Force(EnumNode('biome')),
  parameters: ObjectNode({
    altitude: Force(NumberNode({ min: -1, max: 1 })),
    temperature: Force(NumberNode({ min: -1, max: 1 })),
    humidity: Force(NumberNode({ min: -1, max: 1 })),
    weirdness: Force(NumberNode({ min: -1, max: 1 })),
    offset: Force(NumberNode({ min: -1, max: 1 }))
  })
}), {
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

SCHEMAS.register('generator-structures', ObjectNode({
  stronghold: ObjectNode({
    distance: NumberNode({ integer: true }),
    spread: NumberNode({ integer: true }),
    count: NumberNode({ integer: true })
  }, {
    collapse: true
  }),
  structures: MapNode(
    EnumNode('structure_feature'),
    Mod(ObjectNode({
      spacing: NumberNode({ integer: true }),
      separation: NumberNode({ integer: true }),
      salt: NumberNode({ integer: true })
    }), {
      default: () => ({
        spacing: 10,
        separation: 5,
        salt: 0
      })
    })
  )
}))

SCHEMAS.register('generator-layer', Mod(ObjectNode({
  block: Force(Resource(EnumNode('block'))),
  height: Force(NumberNode({ min: 1, integer: true }))
}), {
  default: () => ({
    block: 'stone',
    height: 1
  })
}))

SCHEMAS.register('dimension-type', Mod(ObjectNode({
  ultrawarm: BooleanNode(),
  natural: BooleanNode(),
  shrunk: BooleanNode(),
  ambient_light: NumberNode(),
  fixed_time: NumberNode({ integer: true }),
  has_skylight: BooleanNode(),
  has_ceiling: BooleanNode()
}), {
  default: () => ({
    ultrawarm: false,
    natural: true,
    shrunk: false,
    ambient_light: 0,
    has_skylight: true,
    has_ceiling: false
  })
}))

export const DimensionSchema = SCHEMAS.get('dimension')
export const DimensionTypeSchema = SCHEMAS.get('dimension-type')
