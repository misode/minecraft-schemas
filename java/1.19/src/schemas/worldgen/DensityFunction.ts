import {
  StringNode as RawStringNode,
  Mod,
  ObjectNode,
  Reference as RawReference,
  SchemaRegistry,
  CollectionRegistry,
  Switch,
  Case,
  NumberNode,
	INode,
	ChoiceNode,
	ListNode,
} from '@mcschema/core'

export let DensityFunction: INode

export function initDensityFunctionSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)
  const Reference = RawReference.bind(undefined, schemas)

	DensityFunction = Mod(ChoiceNode([
		{
			type: 'number',
			node: NumberNode(),
			change: () => 0
		},
		{
      type: 'string',
			priority: 1,
      node: StringNode({ validator: 'resource', params: { pool: '$worldgen/density_function' }}),
      change: () => undefined
    },
    {
      type: 'object',
      node: Reference('density_function'),
      change: () => ({})
    }
	], { choiceContext: 'density_function' }), {
		default: () => 0
	})

	const NoiseRange = NumberNode({ min: -1000000, max: 1000000 })
	const YRange = NumberNode({ integer: true, min: -2032 * 2, max: 2031 * 2 })

	schemas.register('density_function', Mod(ObjectNode({
		type: StringNode({ validator: 'resource', params: { pool: 'worldgen/density_function_type' } }),
		[Switch]: [{ push: 'type' }],
		[Case]: {
			'minecraft:abs': {
				argument: DensityFunction,
			},
			'minecraft:add': {
				argument1: DensityFunction,
				argument2: DensityFunction,
			},
			'minecraft:blend_density': {
				argument: DensityFunction,
			},
			'minecraft:cache_2d': {
				argument: DensityFunction,
			},
			'minecraft:cache_all_in_cell': {
				argument: DensityFunction,
			},
			'minecraft:cache_once': {
				argument: DensityFunction,
			},
			'minecraft:clamp': {
				input: Reference('density_function'),
				min: NoiseRange,
				max: NoiseRange,
			},
			'minecraft:constant': {
				argument: NumberNode(),
			},
			'minecraft:cube': {
				argument: DensityFunction,
			},
			'minecraft:flat_cache': {
				argument: DensityFunction,
			},
			'minecraft:half_negative': {
				argument: DensityFunction,
			},
			'minecraft:interpolated': {
				argument: DensityFunction,
			},
			'minecraft:max': {
				argument1: DensityFunction,
				argument2: DensityFunction,
			},
			'minecraft:min': {
				argument1: DensityFunction,
				argument2: DensityFunction,
			},
			'minecraft:mul': {
				argument1: DensityFunction,
				argument2: DensityFunction,
			},
			'minecraft:noise': {
				noise: StringNode({ validator: 'resource', params: { pool: '$worldgen/noise' }}),
				xz_scale: NumberNode(),
				y_scale: NumberNode(),
			},
			'minecraft:old_blended_noise': {
        xz_scale: NumberNode(),
        y_scale: NumberNode(),
        xz_factor: NumberNode(),
        y_factor: NumberNode(),
				smear_scale_multiplier: NumberNode({ min: 1, max: 8 }),
			},
			'minecraft:quarter_negative': {
				argument: DensityFunction,
			},
			'minecraft:range_choice': {
				input: DensityFunction,
				min_inclusive: NoiseRange,
				max_exclusive: NoiseRange,
				when_in_range: DensityFunction,
				when_out_of_range: DensityFunction,
			},
			'minecraft:shift': {
				argument: StringNode({ validator: 'resource', params: { pool: '$worldgen/noise' }}),
			},
			'minecraft:shift_a': {
				argument: StringNode({ validator: 'resource', params: { pool: '$worldgen/noise' }}),
			},
			'minecraft:shift_b': {
				argument: StringNode({ validator: 'resource', params: { pool: '$worldgen/noise' }}),
			},
			'minecraft:shifted_noise': {
				noise: StringNode({ validator: 'resource', params: { pool: '$worldgen/noise' }}),
				xz_scale: NumberNode(),
				y_scale: NumberNode(),
				shift_x: DensityFunction,
				shift_y: DensityFunction,
				shift_z: DensityFunction,
			},
			'minecraft:slide': {
				argument: DensityFunction,
			},
			'minecraft:spline': {
				spline: Reference('cubic_spline'),
			},
			'minecraft:square': {
				argument: DensityFunction,
			},
			'minecraft:squeeze': {
				argument: DensityFunction,
			},
			'minecraft:weird_scaled_sampler': {
				rarity_value_mapper: StringNode({ enum: ['type_1', 'type_2'] }),
				noise: StringNode({ validator: 'resource', params: { pool: '$worldgen/noise' }}),
				input: DensityFunction,
			},
			'minecraft:y_clamped_gradient': {
				from_y: YRange,
				to_y: YRange,
				from_value: NoiseRange,
				to_value: NoiseRange,
			},
		}
	}, { context: 'density_function', disableSwitchContext: true }), {
		default: () => ({
			type: 'minecraft:noise',
			noise: 'minecraft:cave_entrance',
			xz_scale: 0.75,
			y_scale: 0.5
		})
	}))

  schemas.register('cubic_spline', Mod(ChoiceNode([
    {
      type: 'number',
      node: NumberNode()
    },
    {
      type: 'object',
      node: ObjectNode({
        coordinate: DensityFunction,
        points: ListNode(
          ObjectNode({
            location: NumberNode(),
            derivative: NumberNode(),
            value: Reference('cubic_spline')
          })
        )
      }, { category: 'function' })
    }
  ], { context: 'terrain_spline', choiceContext: 'terrain_spline' }), {
    default: () => 0
  }))
}
