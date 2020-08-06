import {
  BooleanNode,
  EnumNode as RawEnumNode,
  Force,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Resource,
  MapNode,
  StringNode,
  SchemaRegistry,
  CollectionRegistry,
} from '@mcschema/core'
import { DefaultNoiseSettings } from '../Common'

export function initNoiseSettingsSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('noise_settings', Mod(ObjectNode({
    name: Mod(Force(Resource(StringNode())), {
      enabled: (path) => path.getArray().length > 0
    }),
    bedrock_roof_position: Force(NumberNode({ integer: true })),
    bedrock_floor_position: Force(NumberNode({ integer: true })),
    sea_level: Force(NumberNode({ integer: true })),
    disable_mob_generation: Force(BooleanNode()),
    default_block: Force(Reference('block_state')),
    default_fluid: Force(Reference('fluid_state')),
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
    default: () => DefaultNoiseSettings
  }))

  schemas.register('generator_structures', ObjectNode({
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

  schemas.register('generator_layer', Mod(ObjectNode({
    block: Force(Resource(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } }))),
    height: Force(NumberNode({ integer: true, min: 1 }))
  }), {
    default: () => ({
      block: 'minecraft:stone',
      height: 1
    })
  }))
}
