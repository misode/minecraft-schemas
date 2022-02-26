import {
  BooleanNode,
  StringNode as RawStringNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  MapNode,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
  INode,
  ModelPath,
  Errors,
  NodeOptions,
  ChoiceNode,
  ListNode,
  Switch,
  Case,
} from '@mcschema/core'
import { DefaultNoiseSettings } from '../Common'
import { DensityFunction } from './DensityFunction'

export function initNoiseSettingsSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('noise_settings', Mod(ObjectNode({
    sea_level: NumberNode({ integer: true }),
    disable_mob_generation: BooleanNode(),
    aquifers_enabled: BooleanNode(),
    ore_veins_enabled: BooleanNode(),
    legacy_random_source: BooleanNode(),
    default_block: Reference('block_state'),
    default_fluid: Reference('block_state'),
    noise: ObjectNode({
      min_y: NumberNode({ integer: true, min: -2048, max: 2047 }),
      height: NumberNode({ integer: true, min: 0, max: 4096 }),
      size_horizontal: NumberNode({ integer: true }),
      size_vertical: NumberNode({ integer: true }),
      sampling: ObjectNode({
        xz_scale: NumberNode(),
        y_scale: NumberNode(),
        xz_factor: NumberNode(),
        y_factor: NumberNode()
      }),
      bottom_slide: Reference('noise_slider'),
      top_slide: Reference('noise_slider'),
      terrain_shaper: Reference('terrain_shaper')
    }),
    noise_router: ObjectNode({
      barrier: DensityFunction,
      fluid_level_floodedness: DensityFunction,
      fluid_level_spread: DensityFunction,
      lava: DensityFunction,
      temperature: DensityFunction,
      vegetation: DensityFunction,
      continents: DensityFunction,
      erosion: DensityFunction,
      depth: DensityFunction,
      initial_density_without_jaggedness: DensityFunction,
      final_density: DensityFunction,
      vein_toggle: DensityFunction,
      vein_ridged: DensityFunction,
      vein_gap: DensityFunction,
    }),
    surface_rule: Reference('material_rule'),
  }, { context: 'noise_settings' }), node => ({
    default: () => DefaultNoiseSettings,
    validate: (path, value, errors, options) => {
      value = node.validate(path, value, errors, options)
      if (value?.noise?.min_y + value?.noise?.height > 2047) {
        errors.add(path.push('noise').push('height'), 'error.min_y_plus_height', 2047)
      }
      if (value?.noise?.height % 16 !== 0) {
        errors.add(path.push('noise').push('height'), 'error.height_multiple', 16)
      }
      if (value?.noise?.min_y % 16 !== 0) {
        errors.add(path.push('noise').push('min_y'), 'error.min_y_multiple', 16)
      }
      return value
    }
  })))

  schemas.register('noise_slider', ObjectNode({
    target: NumberNode(),
    size: NumberNode({ integer: true, min: 0 }),
    offset: NumberNode({ integer: true })
  }))

  schemas.register('generator_layer', Mod(ObjectNode({
    block: StringNode({ validator: 'resource', params: { pool: 'block' } }),
    height: NumberNode({ integer: true, min: 1 })
  }), {
    default: () => ({
      block: 'minecraft:stone',
      height: 1
    })
  }))

  schemas.register('terrain_shaper', Mod(ObjectNode({
    offset: Reference('terrain_spline'),
    factor: Reference('terrain_spline'),
    jaggedness: Reference('terrain_spline'),
  }, { context: 'terrain_shaper' }), {
    default: () => ({
      offset: 0,
      factor: 0,
      jaggedness: 0,
    })
  }))

  schemas.register('terrain_spline', Mod(ChoiceNode([
    {
      type: 'number',
      node: NumberNode()
    },
    {
      type: 'object',
      node: ObjectNode({
        coordinate: Mod(StringNode({ enum: ['continents', 'erosion', 'weirdness', 'ridges'] }), { default: () => 'continents' }),
        points: ListNode(
          ObjectNode({
            location: NumberNode(),
            derivative: NumberNode(),
            value: Reference('terrain_spline')
          })
        )
      }, { category: 'function' })
    }
  ], { context: 'terrain_spline', choiceContext: 'terrain_spline' }), {
    default: () => 0
  }))
}
