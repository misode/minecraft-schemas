import { EnumNode } from '../../nodes/EnumNode';
import { ResourceNode } from '../nodes/ResourceNode';
import { NumberNode } from '../../nodes/NumberNode';
import { BooleanNode } from '../../nodes/BooleanNode';
import { ObjectNode, Switch, Case } from '../../nodes/ObjectNode';
import { ListNode } from '../../nodes/ListNode';
import { RangeNode } from '../nodes/RangeNode';
import { MapNode } from '../../nodes/MapNode';
import { StringNode } from '../../nodes/StringNode';
import { ReferenceNode } from '../../nodes/ReferenceNode';
import { SCHEMAS, COLLECTIONS } from '../../Registries';

SCHEMAS.register('dimension', new ObjectNode({
  type: new StringNode(),
  generator: new ObjectNode({
    type: new EnumNode(['noise', 'flat', 'debug']),
    seed: new NumberNode({ integer: true }),
    [Switch]: path => path.push('type').get(),
    [Case]: {
      'noise': {
        biome_source: new ObjectNode({
          type: new EnumNode(['fixed', 'multi_noise', 'checkerboard', 'vanilla_layered', 'the_end']),
          seed: new NumberNode({ integer: true }),
          [Switch]: path => path.push('type').get(),
          [Case]: {
            'fixed': {
              biome: new EnumNode(COLLECTIONS.get('biomes'))
            },
            'multi_noise': {
              preset: new EnumNode(['nether']),
              biomes: new ListNode(
                new ReferenceNode('generator-biome')
              )
            },
            'checkerboard': {
              biomes: new ListNode(
                new EnumNode(COLLECTIONS.get('biomes'))
              )
            },
            'vanilla_layered': {
              large_biomes: new BooleanNode()
            }
          }
        }, {
          category: 'predicate'
        }),
        settings: new ObjectNode({
          bedrock_roof_position: new NumberNode({ integer: true }),
          bedrock_floor_position: new NumberNode({ integer: true }),
          sea_level: new NumberNode({ integer: true }),
          disable_mob_generation: new BooleanNode(),
          default_block: new ObjectNode({
            Name: new StringNode(),
            Properties: new MapNode(
              new StringNode(),
              new StringNode()
            )
          }),
          default_fluid: new ObjectNode({
            Name: new StringNode(),
            Properties: new MapNode(
              new StringNode(),
              new StringNode({default: () => ""})
            )
          }),
          noise: new ObjectNode({
            density_factor: new NumberNode(),
            density_offset: new NumberNode(),
            simplex_surface_noise: new BooleanNode(),
            random_density_offset: new BooleanNode(),
            island_noise_override: new BooleanNode(),
            amplified: new BooleanNode(),
            size_horizontal: new NumberNode({ integer: true }),
            size_vertical: new NumberNode({ integer: true }),
            height: new NumberNode({ integer: true }),
            sampling: new ObjectNode({
              xz_scale: new NumberNode(),
              y_scale: new NumberNode(),
              xz_factor: new NumberNode(),
              y_factor: new NumberNode()
            }),
            bottom_slide: new ObjectNode({
              target: new NumberNode({ integer: true }),
              size: new NumberNode({ integer: true }),
              offset: new NumberNode({ integer: true })
            }),
            top_slide: new ObjectNode({
              target: new NumberNode({ integer: true }),
              size: new NumberNode({ integer: true }),
              offset: new NumberNode({ integer: true })
            })
          }, { collapse: true }),
          structures: new ReferenceNode('generator-structures')
        }, { collapse: true })
      },
      'flat': {
        settings: new ObjectNode({
          biome: new EnumNode(COLLECTIONS.get('biomes')),
          layers: new ListNode(
            new ReferenceNode('generator-layer')
          ),
          structures: new ReferenceNode('generator-structures')
        }, { collapse: true })
      }
    }
  })
}, {
  default: () => ({
    generator: {
      type: 'noise',
      seed: 0,
      biome_source: {
        type: 'multi_noise',
        seed: 0
      }
    }
  })
}))

SCHEMAS.register('generator-biome', new ObjectNode({
  biome: new EnumNode(COLLECTIONS.get('biomes')),
  parameters: new ObjectNode({
    altitude: new NumberNode(),
    temperature: new NumberNode(),
    humidity: new NumberNode(),
    weirdness: new NumberNode(),
    offset: new NumberNode()
  })
}, {
  default: () => ({
    biome: 'plains',
    parameters: {
      altitude: 0,
      temperature: 0,
      humidity: 0,
      weirdness: 0,
      offset: 0
    }
  })
}))

SCHEMAS.register('generator-structures', new ObjectNode({
  stronghold: new ObjectNode({
    distance: new NumberNode({ integer: true }),
    spread: new NumberNode({ integer: true }),
    count: new NumberNode({ integer: true })
  }, {
    collapse: true
  }),
  structures: new MapNode(
    new EnumNode(COLLECTIONS.get('structures')),
    new ObjectNode({
      spacing: new NumberNode({ integer: true }),
      separation: new NumberNode({ integer: true }),
      salt: new NumberNode({ integer: true })
    }, {
      default: () => ({
        spacing: 10,
        separation: 5,
        salt: 0
      })
    })
  )
}))

SCHEMAS.register('generator-layer', new ObjectNode({
  block: new ResourceNode(COLLECTIONS.get('blocks')),
  height: new NumberNode({ integer: true })
}, {
  default: () => ({
    block: 'stone',
    height: 1
  })
}))

SCHEMAS.register('dimension-type', new ObjectNode({
  ultrawarm: new BooleanNode(),
  natural: new BooleanNode(),
  shrunk: new BooleanNode(),
  ambient_light: new NumberNode(),
  fixed_time: new NumberNode({ integer: true }),
  has_skylight: new BooleanNode(),
  has_ceiling: new BooleanNode()
}, {
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
