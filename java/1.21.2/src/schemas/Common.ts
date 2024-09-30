import {
  StringNode as RawStringNode,
  ObjectNode,
  MapNode,
  ListNode,
  NumberNode,
  ChoiceNode,
  Reference as RawReference,
  INode,
  SchemaRegistry,
  CollectionRegistry,
  NestedNodeChildren,
  BooleanNode,
  ObjectOrPreset,
  Opt,
  Mod,
  Switch,
  Case,
  ResourceType,
  NodeChildren,
} from '@mcschema/core'

export let ConditionCases: (entitySourceNode?: INode<any>) => NestedNodeChildren
export let FunctionCases: (conditions: NodeChildren, copySourceNode?: INode<any>, entitySourceNode?: INode<any>) => NestedNodeChildren

export const DefaultNoiseSettings = {
	sea_level: 63,
	ore_veins_enabled: true,
	disable_mob_generation: false,
	aquifers_enabled: true,
  legacy_random_source: false,
	default_block: {
    Name: 'minecraft:stone'
	},
	default_fluid: {
    Properties: {
      level: '0'
		},
		Name: 'minecraft:water'
	},
	noise: {
		min_y: -64,
		height: 384,
		size_horizontal: 1,
		size_vertical: 2,
		top_slide: {
			target: -0.078125,
			size: 2,
			offset: 8
		},
		bottom_slide: {
			target: 0.1171875,
			size: 3,
			offset: 0
		},
		sampling: {
			xz_scale: 0.9999999814507745,
			y_scale: 0.9999999814507745,
			xz_factor: 80,
			y_factor: 160
		},
    terrain_shaper: {
      offset: 0,
      factor: 0,
      jaggedness: 0
    }
	},
  noise_router: {
    barrier: 0,
    fluid_level_floodedness: 0,
    fluid_level_spread: 0,
    lava: 0,
    temperature: 0,
    vegetation: 0,
    continents: 0,
    erosion: 0,
    depth: 0,
    ridges: 0,
    initial_density_without_jaggedness: 0,
    final_density: {
      type: 'minecraft:interpolated',
      argument: 'minecraft:overworld/base_3d_noise'
    },
    vein_toggle: 0,
    vein_ridged: 0,
    vein_gap: 0,
  },
  surface_rule: {
    type: 'minecraft:sequence',
    sequence: []
  }
}
export let NoiseSettingsPresets: (node: INode) => INode

type MinMaxConfig = {
  min?: number
  max?: number
}
export let FloatProvider: (config?: MinMaxConfig) => INode
export let IntProvider: (config?: MinMaxConfig) => INode

type InclusiveRangeConfig = {
  integer?: boolean
  min?: number
  max?: number
}
export let InclusiveRange: (config?: InclusiveRangeConfig) => INode

type NonTagResources = Exclude<ResourceType, `$tag/${string}`>

type TagConfig = {
  resource: NonTagResources,
  inlineSchema?: string,
}
export let Tag: (config: TagConfig) => INode

export let Filterable: (node: INode) => INode

type SizeLimitedStringConfig = {
  minLength?: number,
  maxLength?: number,
}
export let SizeLimitedString: (config: SizeLimitedStringConfig) => INode

export function initCommonSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)
  const Reference = RawReference.bind(undefined, schemas)

  schemas.register('block_state', Mod(ObjectNode({
    Name: StringNode({ validator: 'resource', params: { pool: 'block' } }),
    Properties: Opt(MapNode(
      StringNode(),
      StringNode(),
      { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'Name' }] } } }
    ))
  }, { context: 'block_state' }), {
    default: () => ({
      Name: 'minecraft:stone'
    })
  }))

  schemas.register('fluid_state', Mod(ObjectNode({
    Name: StringNode({ validator: 'resource', params: { pool: 'fluid' } }),
    Properties: Opt(MapNode(
      StringNode(),
      StringNode()
    ))
  }, { context: 'fluid_state' }), {
    default: () => ({
      Name: 'minecraft:water',
      Properties: {
        'level': '0'
      }
    })
  }))

  schemas.register('item_non_air', Mod(StringNode({ validator: 'resource', params: { pool: 'item' } }), node => ({
    validate: (path, value, errors, options) => {
      if (typeof value === 'string' && value?.replace(/^minecraft:/, '') === 'air') {
        errors.add(path, 'error.item_stack_not_air')
      }
      return node.validate(path, value, errors, options)
    }
  })))

  schemas.register('item_stack', ObjectNode({
    id: Reference('item_non_air'),
    count: Opt(NumberNode({ integer: true, min: 1 })),
    components: Opt(Reference('data_component_patch')),
  }, { context: 'item_stack' }))

  schemas.register('single_item_stack', Mod(ObjectNode({
    id: Reference('item_non_air'),
    components: Opt(Reference('data_component_patch'))
  }), {
    default: () => ({
      id: 'minecraft:stone'
    })
  }))

  schemas.register('vec3', Mod(ListNode(
    NumberNode(),
    { minLength: 3, maxLength: 3 }
  ), {
    default: () => [0, 0, 0]
  }))

  schemas.register('block_pos', Mod(ListNode(
    NumberNode({ integer: true }),
    { minLength: 3, maxLength: 3 }
  ), {
    default: () => [0, 0, 0]
  }))

  const blockParticleFields = {
    block_state: ChoiceNode([
      {
        type: 'string',
        node: StringNode({ validator: 'resource', params: { pool: 'block' } }),
        change: v => typeof v === 'object' && v !== null ? v.Name ?? '' : ''
      },
      {
        type: 'object',
        node: Reference('block_state'),
        change: v => ({ Name: v }),
      }
    ])
  }

  schemas.register('particle', ObjectNode({
		type: StringNode({ validator: 'resource', params: { pool: 'particle_type' }}),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:block': blockParticleFields,
      'minecraft:block_marker': blockParticleFields,
      'minecraft:dust': {
        color: Reference('vec3'),
        scale: NumberNode({ min: 0.01, max: 4 }),
      },
      'minecraft:dust_color_transition': {
        from_color: Reference('vec3'),
        to_color: Reference('vec3'),
        scale: NumberNode({ min: 0.01, max: 4 }),
      },
      'minecraft:dust_pillar': blockParticleFields,
      'minecraft:entity_effect': {
        color: ChoiceNode([
          {
            type: 'number',
            node: NumberNode({ integer: true })
          },
          {
            type: 'list',
            node: ListNode(
              NumberNode({ min: 0, max: 1 }),
              { minLength: 4, maxLength: 4 }
            )
          },
        ])
      },
      'minecraft:item': {
        item: ChoiceNode([
          {
            type: 'string',
            node: Reference('item_non_air'),
          },
          {
            type: 'object',
            node: Reference('item_stack'),
          },
        ]),
      },
      'minecraft:falling_dust': blockParticleFields,
      'minecraft:sculk_charge': {
        roll: NumberNode(),
      },
      'minecraft:vibration': {
        destination: ObjectNode({
          type: StringNode({ enum: ['block'] }),
          pos: Reference('block_pos'),
        }),
        arrival_in_ticks: NumberNode({ integer: true }),
      },
      'minecraft:shriek': {
        delay: NumberNode({ integer: true }),
      },
    }
	}, { context: 'particle' }))

  schemas.register('sound_event', ChoiceNode([
    {
      type: 'string',
      node: StringNode()
    },
    {
      type: 'object',
      node: ObjectNode({
        sound_id: StringNode(),
        range: Opt(NumberNode()),
      })
    },
  ], { context: 'sound_event' }))

  const Bounds = (integer?: boolean) => ChoiceNode([
    {
      type: 'number',
      node: NumberNode({ integer }),
      change: (v: any) => v === undefined ? 0 : v.min ?? v.max ?? 0
    },
    {
      type: 'object',
      node: ObjectNode({
        min: Opt(NumberNode({ integer })),
        max: Opt(NumberNode({ integer }))
      }, { context: 'range' }),
      change: (v: any) => ({
        min: v ?? 0,
        max: v ?? 0
      })
    }
  ], { context: 'range' })

  schemas.register('int_bounds', Bounds(true))

  schemas.register('float_bounds', Bounds())

  schemas.register('int_range', ChoiceNode([
    {
      type: 'object',
      node: ObjectNode({
        min: Opt(Reference('number_provider')),
        max: Opt(Reference('number_provider'))
      })
    },
    {
      type: 'number',
      node: NumberNode({ integer: true })
    }
  ], { context: 'range' }))

  schemas.register('resource_location_pattern', ObjectNode({
    namespace: Opt(StringNode({ validator: 'regex_pattern' })),
    path: Opt(StringNode({ validator: 'regex_pattern' })),
  }, { context: 'resource_location_pattern' }))

  const ObjectWithType = (pool: ResourceType, directType: string, directPath: string, directDefault: string, objectDefault: string | null, context: string, cases: NestedNodeChildren) => {
    let defaultCase: NodeChildren = {}
    if (objectDefault) {
      Object.keys(cases[objectDefault]).forEach(k => {
        defaultCase[k] = Mod(cases[objectDefault][k], {
          enabled: path => path.push('type').get() === undefined
        })
      })
    }
    const provider = ObjectNode({
      type: Mod(Opt(StringNode({ validator: 'resource', params: { pool } })), {
        hidden: () => true
      }),
      [Switch]: [{ push: 'type' }],
      [Case]: cases,
      ...defaultCase
    }, { context, disableSwitchContext: true })

    const choices: any[] = [{
      type: directType,
      node: cases[directDefault][directPath]
    }]
    if (objectDefault) {
      choices.push({
        type: 'object',
        priority: -1,
        node: provider
      })
    }
    Object.keys(cases).forEach(k => {
      choices.push({
        type: k,
        match: (v: any) => {
          const type = 'minecraft:' + v?.type?.replace(/^minecraft:/, '')
          if (type === k) return true
          const keys = v ? Object.keys(v) : []
          return typeof v === 'object' && (keys?.length === 0 || (keys?.length === 1 && keys?.[0] === 'type'))
        },
        node: provider,
        change: (v: any) => ({type: k})
      })
    })
    return ChoiceNode(choices, { context, choiceContext: `${context}.type` })
  }

  schemas.register('number_provider', ObjectWithType(
    'loot_number_provider_type',
    'number', 'value', 'minecraft:constant',
    'minecraft:uniform',
    'number_provider',
    {
      'minecraft:constant': {
        value: NumberNode()
      },
      'minecraft:uniform': {
        min: Reference('number_provider'),
        max: Reference('number_provider')
      },
      'minecraft:binomial': {
        n: Reference('number_provider'),
        p: Reference('number_provider')
      },
      'minecraft:score': {
        target: Reference('scoreboard_name_provider'),
        score: StringNode({ validator: 'objective' }),
        scale: Opt(NumberNode())
      },
      'minecraft:storage': {
        storage: StringNode({ validator: 'resource', params: { pool: '$storage' } }),
        path: StringNode({ validator: 'nbt_path' }),
      },
      'minecraft:enchantment_level': {
        amount: Reference('level_based_value'),
      }
    }))

  schemas.register('scoreboard_name_provider', ObjectWithType(
    'loot_score_provider_type',
    'string', 'target', 'minecraft:context',
    null,
    'score_provider',
    {
      'minecraft:fixed': {
        name: StringNode({ validator: 'entity', params: { amount: 'multiple', type: 'entities', isScoreHolder: true } }) // FIXME: doesn't support selectors
      },
      'minecraft:context': {
        target: Mod(StringNode({ enum: 'entity_source' }), { default: () => 'this' })
      }
    }))

  schemas.register('nbt_provider', ObjectWithType(
    'loot_nbt_provider_type',
    'string', 'target', 'minecraft:context',
    null,
    'nbt_provider',
    {
      'minecraft:storage': {
        source: StringNode({ validator: 'resource', params: { pool: '$storage' } })
      },
      'minecraft:context': {
        target: Mod(StringNode({ enum: 'copy_source' }), { default: () => 'this' })
      }
    }
  ))

  schemas.register('level_based_value', ObjectWithType(
    'enchantment_level_based_value_type',
    'number', 'value', 'minecraft:constant',
    null,
    'level_based_value',
    {
      'minecraft:constant': { // TODO: doesn't actually exist in this form?
        value: NumberNode(),
      },
      'minecraft:clamped': {
        value: Reference('level_based_value'),
        min: NumberNode(),
        max: NumberNode(),
      },
      'minecraft:fraction': {
        numerator: Reference('level_based_value'),
        denominator: Reference('level_based_value'),
      },
      'minecraft:levels_squared': {
        added: NumberNode(),
      },
      'minecraft:linear': {
        base: NumberNode(),
        per_level_above_first: NumberNode(),
      },
      'minecraft:lookup': {
        values: ListNode(NumberNode()),
        fallback: Reference('level_based_value')
      }
    }))

  FloatProvider = (config?: MinMaxConfig) => ObjectWithType(
    'float_provider_type',
    'number', 'value', 'minecraft:constant',
    null,
    'float_provider',
    {
      'minecraft:constant': {
        value: NumberNode(config)
      },
      'minecraft:uniform': {
        min_inclusive: NumberNode(config),
        max_exclusive: NumberNode(config)
      },
      'minecraft:clamped_normal': {
        min: NumberNode(),
        max: NumberNode(),
        mean: NumberNode(),
        deviation: NumberNode()
      },
      'minecraft:trapezoid': {
        min: NumberNode(),
        max: NumberNode(),
        plateau: NumberNode()
      }
    }
  )

  schemas.register('float_provider', FloatProvider())

  IntProvider = (config?: MinMaxConfig) => ObjectWithType(
    'int_provider_type',
    'number', 'value', 'minecraft:constant',
    null,
    'int_provider',
    {
      'minecraft:constant': {
        value: NumberNode({ integer: true, ...config })
      },
      'minecraft:uniform': {
        min_inclusive: NumberNode({ integer: true, ...config }),
        max_inclusive: NumberNode({ integer: true, ...config })
      },
      'minecraft:biased_to_bottom': {
        min_inclusive: NumberNode({ integer: true, ...config }),
        max_inclusive: NumberNode({ integer: true, ...config })
      },
      'minecraft:clamped': {
        min_inclusive: NumberNode({ integer: true, ...config }),
        max_inclusive: NumberNode({ integer: true, ...config }),
        source: Reference('int_provider')
      },
      'minecraft:clamped_normal': {
        min_inclusive: NumberNode({ integer: true, ...config }),
        max_inclusive: NumberNode({ integer: true, ...config }),
        mean: NumberNode(),
        deviation: NumberNode()
      },
      'minecraft:weighted_list': {
        distribution: ListNode(
          ObjectNode({
            weight: NumberNode({ integer: true }),
            data: Reference('int_provider'),
          })
        )
      }
    }
  )

  schemas.register('int_provider', IntProvider())

  schemas.register('vertical_anchor', ChoiceNode(
    ['absolute', 'above_bottom', 'below_top'].map(t => ({
      type: t,
      match: v => v?.[t] !== undefined,
      change: v => ({ [t]: v.absolute ?? v.above_bottom ?? v.below_top ?? 0 }),
      node: ObjectNode({
        [t]: NumberNode({ integer: true, min: -2048, max: 2047 })
      })
    })),
    { context: 'vertical_anchor' }
  ))

  schemas.register('height_provider', ObjectWithType(
    'height_provider_type',
    'number', 'value', 'minecraft:constant',
    null,
    'height_provider',
    {
      'minecraft:constant': {
        value: Reference('vertical_anchor')
      },
      'minecraft:uniform': {
        min_inclusive: Reference('vertical_anchor'),
        max_inclusive: Reference('vertical_anchor')
      },
      'minecraft:biased_to_bottom': {
        min_inclusive: Reference('vertical_anchor'),
        max_inclusive: Reference('vertical_anchor'),
        inner: Opt(NumberNode({ integer: true, min: 1 }))
      },
      'minecraft:very_biased_to_bottom': {
        min_inclusive: Reference('vertical_anchor'),
        max_inclusive: Reference('vertical_anchor'),
        inner: Opt(NumberNode({ integer: true, min: 1 }))
      },
      'minecraft:trapezoid': {
        min_inclusive: Reference('vertical_anchor'),
        max_inclusive: Reference('vertical_anchor'),
        plateau: Opt(NumberNode({ integer: true }))
      },
      'minecraft:weighted_list': {
        distribution: ListNode(
          ObjectNode({
            weight: NumberNode({ integer: true }),
            data: Reference('height_provider'),
          })
        )
      }
    }
  ))

  InclusiveRange = (config?: MinMaxConfig) => ObjectNode({
    min_inclusive: NumberNode(config),
    max_inclusive: NumberNode(config)
  }, { context: 'range' })

  schemas.register('noise_parameters',Mod(ObjectNode({
    firstOctave: NumberNode({ integer: true }),
    amplitudes: ListNode(
      NumberNode()
    )
  }, { context: 'noise_parameters' }), {
    default: () => ({
      firstOctave: -7,
      amplitudes: [1, 1]
    })
  }))

  Tag = (config: TagConfig) => ChoiceNode([
    {
      type: 'string',
      node: StringNode({ validator: 'resource', params: { pool: config.resource, allowTag: true } }),
      change: (v: unknown) => {
        if (Array.isArray(v) && typeof v[0] === 'string' && !v[0].startsWith('#')) {
          return v[0]
        }
        return undefined
      }
    },
    {
      type: 'list',
      node: ListNode(
        config.inlineSchema
          ? ChoiceNode([
            {
              type: 'string',
              node: StringNode({ validator: 'resource', params: { pool: config.resource } })
            },
            {
              type: 'object',
              node: Reference(config.inlineSchema)
            }
          ], { choiceContext: 'tag.list' })
          : StringNode({ validator: 'resource', params: { pool: config.resource } })
      ),
      change: (v: unknown) => {
        if (typeof v === 'string' && !v.startsWith('#')) {
          return [v]
        }
        return [""]
      }
    },
  ], { choiceContext: 'tag' })

  Filterable = (node: INode) => ChoiceNode([
    {
      type: 'simple',
      match: () => true,
      change: v => typeof v === 'object' && v?.raw ? v.raw : undefined,
      node: node,
    },
    {
      type: 'filtered',
      match: v => typeof v === 'object' && v !== null && v.raw !== undefined,
      change: v => ({ raw: v }),
      priority: 1,
      node: ObjectNode({
        raw: node,
        filtered: Opt(node),
      }),
    },
  ], { context: 'filterable' })

  SizeLimitedString = ({ minLength, maxLength }: SizeLimitedStringConfig) => Mod(StringNode(), node => ({
    validate: (path, value, errors, options) => {
      value = node.validate(path, value, errors, options)
      if (minLength !== undefined && typeof value === 'string' && value.length < minLength) {
        errors.add(path, 'error.invalid_string_range.smaller', value.length, minLength)
      }
      if (maxLength !== undefined && typeof value === 'string' && value.length > maxLength) {
        errors.add(path, 'error.invalid_string_range.larger', value.length, maxLength)
      }
      return value
    }
  }))

  const ListOperationFields = ({ maxLength }: { maxLength: number }) => ({
    mode: StringNode({ enum: 'list_operation' }),
    offset: Opt(Mod(NumberNode({ integer: true, min: 0 }), {
      enabled: (path) => ['insert', 'replace_section'].includes(path.push("mode").get())
    })),
    size: Opt(Mod(NumberNode({ integer: true, min: 0, max: maxLength }), {
      enabled: (path) => ['replace_section'].includes(path.push("mode").get())
    })),
  })

  const ListOperation = ({ node, maxLength }: { node: INode, maxLength: number }) => ObjectNode({
    values: ListNode(node),
    ...ListOperationFields({ maxLength })
  }, { context: 'list_operation'})

  ConditionCases = (entitySourceNode: INode<any> = StringNode({ enum: 'entity_source' })) => ({
    'minecraft:all_of': {
      terms: ListNode(
        Reference('condition')
      )
    },
    'minecraft:any_of': {
      terms: ListNode(
        Reference('condition')
      )
    },
    'minecraft:block_state_property': {
      block: StringNode({ validator: 'resource', params: { pool: 'block' } }),
      properties: MapNode(
        StringNode(),
        StringNode(),
        { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'block' }] } } }
      )
    },
    'minecraft:damage_source_properties': {
      predicate: Reference('damage_source_predicate')
    },
    'minecraft:enchantment_active_check': {
      active: BooleanNode(),
    },
    'minecraft:entity_properties': {
      entity: entitySourceNode,
      predicate: Reference('entity_predicate')
    },
    'minecraft:entity_scores': {
      entity: entitySourceNode,
      scores: MapNode(
        StringNode({ validator: 'objective' }),
        Reference('int_range')
      )
    },
    'minecraft:inverted': {
      term: Reference('condition')
    },
    'minecraft:killed_by_player': {
      inverse: Opt(BooleanNode())
    },
    'minecraft:location_check': {
      offsetX: Opt(NumberNode({ integer: true })),
      offsetY: Opt(NumberNode({ integer: true })),
      offsetZ: Opt(NumberNode({ integer: true })),
      predicate: Reference('location_predicate')
    },
    'minecraft:match_tool': {
      predicate: Reference('item_predicate')
    },
    'minecraft:random_chance': {
      chance: Reference('number_provider')
    },
    'minecraft:random_chance_with_enchanted_bonus': {
      enchantment: StringNode({ validator: 'resource', params: { pool: 'enchantment' } }),
      unenchanted_chance: NumberNode({ min: 0, max: 1}),
      enchanted_chance: Reference('level_based_value'),
    },
    'minecraft:reference': {
      name: StringNode({ validator: 'resource', params: { pool: '$predicate' } })
    },
    'minecraft:table_bonus': {
      enchantment: StringNode({ validator: 'resource', params: { pool: 'enchantment' } }),
      chances: ListNode(
        NumberNode({ min: 0, max: 1 }),
        { minLength: 1 },
      )
    },
    'minecraft:time_check': {
      value: Reference('int_range'),
      period: Opt(NumberNode({ integer: true }))
    },
    'minecraft:value_check': {
      value: Reference('number_provider'),
      range: Reference('int_range')
    },
    'minecraft:weather_check': {
      raining: Opt(BooleanNode()),
      thundering: Opt(BooleanNode())
    }
  })

  FunctionCases = (conditions: NodeChildren, copySourceNode: INode<any> = StringNode({ enum: 'copy_source' }), entitySourceNode: INode<any> = StringNode({ enum: 'entity_source' })) => {
    const cases: NestedNodeChildren = {
      'minecraft:apply_bonus': {
        enchantment: StringNode({ validator: 'resource', params: { pool: 'enchantment' } }),
        formula: StringNode({ validator: 'resource', params: { pool: collections.get('loot_table_apply_bonus_formula') } }),
        parameters: Mod(ObjectNode({
          bonusMultiplier: Mod(NumberNode(), {
            enabled: path => path.pop().push('formula').get() === 'minecraft:uniform_bonus_count'
          }),
          extra: Mod(NumberNode(), {
            enabled: path => path.pop().push('formula').get() === 'minecraft:binomial_with_bonus_count'
          }),
          probability: Mod(NumberNode(), {
            enabled: path => path.pop().push('formula').get() === 'minecraft:binomial_with_bonus_count'
          })
        }), {
          enabled: path => path.push('formula').get() !== 'minecraft:ore_drops'
        })
      },
      'minecraft:copy_components': {
        source: StringNode({ enum: ['block_entity'] }),
        include: Opt(ListNode(
          StringNode({ validator: 'resource', params: { pool: 'data_component_type' } }),
        )),
        exclude: Opt(ListNode(
          StringNode({ validator: 'resource', params: { pool: 'data_component_type' } }),
        )),
      },
      'minecraft:copy_custom_data': {
        source: Reference('nbt_provider'),
        ops: ListNode(
          ObjectNode({
            source: StringNode({ validator: 'nbt_path', params: { category: { getter: 'copy_source', path: ['pop', 'pop', 'pop', { push: 'source' }] } } }),
            target: StringNode({ validator: 'nbt_path', params: { category: 'minecraft:item' } }),
            op: StringNode({ enum: ['replace', 'append', 'merge'] })
          }, { context: 'nbt_operation' })
        )
      },
      'minecraft:copy_name': {
        source: copySourceNode
      },
      'minecraft:copy_state': {
        block: StringNode({ validator: 'resource', params: { pool: 'block' } }),
        properties: ListNode(
          StringNode({ validator: 'block_state_key', params: { id: ['pop', 'pop', { push: 'block' }] } })
        )
      },
      'minecraft:enchant_randomly': {
        options: Opt(Tag({ resource: 'enchantment' })),
        only_compatible: Opt(BooleanNode()),
      },
      'minecraft:enchant_with_levels': {
        levels: Reference('number_provider'),
        options: Opt(Tag({ resource: 'enchantment' })),
      },
      'minecraft:enchanted_count_increase': {
        enchantment: StringNode({ validator: 'resource', params: { pool: 'enchantment' }}),
        count: Reference('number_provider'),
        limit: Opt(NumberNode({ integer: true }))
      },
      'minecraft:exploration_map': {
        destination: Opt(StringNode({ validator: 'resource', params: { pool: '$tag/worldgen/structure' } })),
        decoration: Opt(StringNode({ enum: 'map_decoration' })),
        zoom: Opt(NumberNode({ integer: true })),
        search_radius: Opt(NumberNode({ integer: true })),
        skip_existing_chunks: Opt(BooleanNode())
      },
      'minecraft:fill_player_head': {
        entity: entitySourceNode
      },
      'minecraft:filtered': {
        item_filter: Reference('item_predicate'),
        modifier: Reference('item_modifier'),
      },
      'minecraft:limit_count': {
        limit: Reference('int_range')
      },
      'minecraft:modify_contents': {
        component: StringNode({ validator: 'resource', params: { pool: collections.get('container_component_manipulators') } }),
        modifier: Reference('item_modifier'),
      },
      'minecraft:reference': {
        name: StringNode({ validator: 'resource', params: { pool: '$item_modifier' } })
      },
      'minecraft:sequence': {
        functions: ListNode(
          Reference('function')
        ),
      },
      'minecraft:set_attributes': {
        modifiers: ListNode(
          Reference('attribute_modifier')
        ),
        replace: Opt(BooleanNode()),
      },
      'minecraft:set_banner_pattern': {
        patterns: ListNode(
          ObjectNode({
            pattern: StringNode({ enum: 'banner_pattern' }),
            color: StringNode({ enum: 'dye_color' })
          })
        ),
        append: BooleanNode()
      },
      'minecraft:set_book_cover': {
        title: Opt(Filterable(SizeLimitedString({ maxLength: 32 }))),
        author: Opt(StringNode()),
        generation: Opt(NumberNode({ integer: true, min: 0, max: 3 })),
      },
      'minecraft:set_components': {
        components: Reference('data_component_patch'),
      },
      'minecraft:set_contents': {
        component: StringNode({ validator: 'resource', params: { pool: collections.get('container_component_manipulators') } }),
        entries: ListNode(
          Reference('loot_entry')
        )
      },
      'minecraft:set_count': {
        count: Reference('number_provider'),
        add: Opt(BooleanNode())
      },
      'minecraft:set_custom_data': {
        tag: Reference('custom_data_component'),
      },
      'minecraft:set_custom_model_data': {
        value: Reference('number_provider'),
      },
      'minecraft:set_damage': {
        damage: Reference('number_provider'),
        add: Opt(BooleanNode())
      },
      'minecraft:set_enchantments': {
        enchantments: MapNode(
          StringNode({ validator: 'resource', params: { pool: 'enchantment' } }),
          Reference('number_provider')
        ),
        add: Opt(BooleanNode())
      },
      'minecraft:set_fireworks': {
        explosions: Opt(ListOperation({
          node: Reference('firework_explosion'),
          maxLength: 256,
        })),
        flight_duration: Opt(NumberNode({ integer: true, min: 0, max: 255 })),
      },
      'minecraft:set_firework_explosion': {
        shape: Opt(StringNode({ enum: 'firework_explosion_shape' })),
        colors: Opt(ListNode(
          NumberNode({ color: true }),
        )),
        fade_colors: Opt(ListNode(
          NumberNode({ color: true }),
        )),
        trail: Opt(BooleanNode()),
        twinkle: Opt(BooleanNode()),
      },
      'minecraft:set_instrument': {
        options: StringNode({ validator: 'resource', params: { pool: 'instrument', requireTag: true } })
      },
      'minecraft:set_item': {
        item: StringNode({ validator: 'resource', params: { pool: 'item' } }),
      },
      'minecraft:set_loot_table': {
        type: StringNode({ validator: 'resource', params: { pool: 'block_entity_type' } }),
        name: StringNode({ validator: 'resource', params: { pool: '$loot_table' } }),
        seed: Opt(NumberNode({ integer: true }))
      },
      'minecraft:set_lore': {
        entity: Opt(entitySourceNode),
        lore: ListNode(
          Reference('text_component'),
          { maxLength: 256 },
        ),
        ...ListOperationFields({ maxLength: 256 }),
      },
      'minecraft:set_name': {
        entity: Opt(entitySourceNode),
        target: Opt(StringNode({ enum: ['custom_name', 'item_name'] })),
        name: Opt(Reference('text_component'))
      },
      'minecraft:set_ominous_bottle_amplifier': {
        amplifier: Reference('number_provider'),
      },
      'minecraft:set_potion': {
        id: StringNode({ validator: 'resource', params: { pool: 'potion' } })
      },
      'minecraft:ominous_bottle_amplifier': {
        amplifier: Reference('number_provider')
      },
      'minecraft:set_stew_effect': {
        effects: Opt(ListNode(
          ObjectNode({
            type: StringNode({ validator: 'resource', params: { pool: 'mob_effect' } }),
            duration: Reference('number_provider')
          })
        ))
      },
      'minecraft:set_writable_book_pages': {
        pages: ListNode(
          Filterable(SizeLimitedString({ maxLength: 1024 })),
          { maxLength: 100 },
        ),
        ...ListOperationFields({ maxLength: 100 }),
      },
      'minecraft:set_written_book_pages': {
        pages: ListNode(
          Filterable(Reference('text_component')),
          { maxLength: 100 },
        ),
        ...ListOperationFields({ maxLength: 100 }),
      },
      'minecraft:toggle_tooltips': {
        toggles: MapNode(
          StringNode({ validator: 'resource', params: { pool: collections.get('toggleable_data_component_type') }}),
          BooleanNode(),
        ),
      },
    }
    const res: NestedNodeChildren = {}
    collections.get('loot_function_type').forEach(f => {
      res[f] = {...cases[f], ...(f === 'minecraft:sequence' ? {} : conditions) }
    })
    return res
  }

  NoiseSettingsPresets = (node: INode<any>) => ObjectOrPreset(
    StringNode({ validator: 'resource', params: { pool: '$worldgen/noise_settings' } }),
    node,
    {
      'minecraft:overworld': DefaultNoiseSettings,
      'minecraft:nether': {
        sea_level: 32,
        ore_veins_enabled: false,
        disable_mob_generation: false,
        aquifers_enabled: false,
        legacy_random_source: true,
        default_block: {
          Name: 'minecraft:netherrack'
        },
        default_fluid: {
          Properties: {
            level: '0'
          },
          Name: 'minecraft:lava'
        },
        noise: {
          min_y: 0,
          height: 128,
          size_horizontal: 1,
          size_vertical: 2,
          top_slide: {
            target: 0.9375,
            size: 3,
            offset: 0
          },
          bottom_slide: {
            target: 2.5,
            size: 4,
            offset: -1
          },
          sampling: {
            xz_scale: 1.0,
            y_scale: 3.0,
            xz_factor: 80.0,
            y_factor: 60.0
          },
          terrain_shaper: {
            offset: 0,
            factor: 0,
            jaggedness: 0
          }
        },
        noise_router: {
          barrier: 0,
          fluid_level_floodedness: 0,
          fluid_level_spread: 0,
          lava: 0,
          temperature: 0,
          vegetation: 0,
          continents: 0,
          erosion: 0,
          depth: 0,
          ridges: 0,
          initial_density_without_jaggedness: 0,
          final_density: {
            type: 'minecraft:interpolated',
            argument: 'minecraft:overworld/base_3d_noise'
          },
          vein_toggle: 0,
          vein_ridged: 0,
          vein_gap: 0,
        },
        surface_rule: {
          type: 'minecraft:sequence',
          sequence: []
        }
      },
      'minecraft:end': {
        sea_level: 0,
        ore_veins_enabled: false,
        disable_mob_generation: false,
        aquifers_enabled: false,
        legacy_random_source: true,
        default_block: {
          Name: 'minecraft:end_stone'
        },
        default_fluid: {
          Name: 'minecraft:air'
        },
        noise: {
          min_y: 0,
          height: 128,
          size_horizontal: 2,
          size_vertical: 1,
          top_slide: {
            target: -23.4375,
            size: 64,
            offset: -46
          },
          bottom_slide: {
            target: -0.234375,
            size: 7,
            offset: 1
          },
          sampling: {
            xz_scale: 2.0,
            y_scale: 1.0,
            xz_factor: 80.0,
            y_factor: 160.0
          },
          terrain_shaper: {
            offset: 0,
            factor: 1,
            jaggedness: 0
          }
        },
        noise_router: {
          barrier: 0,
          fluid_level_floodedness: 0,
          fluid_level_spread: 0,
          lava: 0,
          temperature: 0,
          vegetation: 0,
          continents: 0,
          erosion: 0,
          depth: 0,
          ridges: 0,
          initial_density_without_jaggedness: 0,
          final_density: {
            type: 'minecraft:interpolated',
            argument: 'minecraft:overworld/base_3d_noise'
          },
          vein_toggle: 0,
          vein_ridged: 0,
          vein_gap: 0,
        },
        surface_rule: {
          type: 'minecraft:sequence',
          sequence: []
        }
      },
      'minecraft:amplified': {
        sea_level: 63,
        ore_veins_enabled: true,
        disable_mob_generation: false,
        aquifers_enabled: true,
        legacy_random_source: false,
        default_block: {
          Name: 'minecraft:stone'
        },
        default_fluid: {
          Properties: {
            level: '0'
          },
          Name: 'minecraft:water'
        },
        noise: {
          min_y: -64,
          height: 384,
          size_horizontal: 1,
          size_vertical: 2,
          top_slide: {
            target: -0.078125,
            size: 2,
            offset: 8
          },
          bottom_slide: {
            target: 0.1171875,
            size: 3,
            offset: 0
          },
          sampling: {
            xz_scale: 0.9999999814507745,
            y_scale: 0.9999999814507745,
            xz_factor: 80,
            y_factor: 160
          },
          terrain_shaper: {
            offset: 0,
            factor: 0,
            jaggedness: 0
          }
        },
        noise_router: {
          barrier: 0,
          fluid_level_floodedness: 0,
          fluid_level_spread: 0,
          lava: 0,
          temperature: 0,
          vegetation: 0,
          continents: 0,
          erosion: 0,
          depth: 0,
          ridges: 0,
          initial_density_without_jaggedness: 0,
          final_density: {
            type: 'minecraft:interpolated',
            argument: 'minecraft:overworld/base_3d_noise'
          },
          vein_toggle: 0,
          vein_ridged: 0,
          vein_gap: 0,
        },
        surface_rule: {
          type: 'minecraft:sequence',
          sequence: []
        },
      },
      'minecraft:caves': {
        sea_level: 32,
        ore_veins_enabled: false,
        disable_mob_generation: false,
        aquifers_enabled: false,
        legacy_random_source: true,
        default_block: {
          Name: 'minecraft:stone'
        },
        default_fluid: {
          Properties: {
            level: '0'
          },
          Name: 'minecraft:water'
        },
        noise: {
          min_y: 0,
          height: 128,
          size_horizontal: 1,
          size_vertical: 2,
          top_slide: {
            target: 0.9375,
            size: 3,
            offset: 0
          },
          bottom_slide: {
            target: 2.5,
            size: 4,
            offset: -1
          },
          sampling: {
            xz_scale: 1.0,
            y_scale: 3.0,
            xz_factor: 80.0,
            y_factor: 60.0
          },
          terrain_shaper: {
            offset: 0,
            factor: 0,
            jaggedness: 0
          }
        },
        noise_router: {
          barrier: 0,
          fluid_level_floodedness: 0,
          fluid_level_spread: 0,
          lava: 0,
          temperature: 0,
          vegetation: 0,
          continents: 0,
          erosion: 0,
          depth: 0,
          ridges: 0,
          initial_density_without_jaggedness: 0,
          final_density: {
            type: 'minecraft:interpolated',
            argument: 'minecraft:overworld/base_3d_noise'
          },
          vein_toggle: 0,
          vein_ridged: 0,
          vein_gap: 0,
        },
        surface_rule: {
          type: 'minecraft:sequence',
          sequence: []
        }
      },
      'minecraft:floating_islands': {
        sea_level: 0,
        ore_veins_enabled: false,
        disable_mob_generation: false,
        aquifers_enabled: false,
        legacy_random_source: true,
        default_block: {
          Name: 'minecraft:stone'
        },
        default_fluid: {
          Properties: {
            level: '0'
          },
          Name: 'minecraft:water'
        },
        noise: {
          min_y: 0,
          height: 128,
          size_horizontal: 2,
          size_vertical: 1,
          top_slide: {
            target: -23.4375,
            size: 64,
            offset: -46
          },
          bottom_slide: {
            target: -0.234375,
            size: 7,
            offset: 1
          },
          sampling: {
            xz_scale: 2.0,
            y_scale: 1.0,
            xz_factor: 80.0,
            y_factor: 160.0
          },
          terrain_shaper: {
            offset: 0,
            factor: 1,
            jaggedness: 0
          }
        },
        noise_router: {
          barrier: 0,
          fluid_level_floodedness: 0,
          fluid_level_spread: 0,
          lava: 0,
          temperature: 0,
          vegetation: 0,
          continents: 0,
          erosion: 0,
          depth: 0,
          ridges: 0,
          initial_density_without_jaggedness: 0,
          final_density: {
            type: 'minecraft:interpolated',
            argument: 'minecraft:overworld/base_3d_noise'
          },
          vein_toggle: 0,
          vein_ridged: 0,
          vein_gap: 0,
        },
        surface_rule: {
          type: 'minecraft:sequence',
          sequence: []
        }
      }
    }
  )
}
