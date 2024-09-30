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

export const DefaultDimensionType = {
  ultrawarm: false,
  natural: true,
  piglin_safe: false,
  respawn_anchor_works: false,
  bed_works: true,
  has_raids: true,
  has_skylight: true,
  has_ceiling: false,
  coordinate_scale: 1,
  ambient_light: 0,
  logical_height: 256,
  infiniburn: '#minecraft:infiniburn_overworld',
  min_y: 0,
  height: 256,
}
export let DimensionTypePresets: (node: INode<any>) => INode<any>

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

type TagConfig = {
  resource: ResourceType,
  inlineSchema?: string,
}
export let Tag: (config: TagConfig) => INode

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

  schemas.register('block_pos', Mod(ListNode(
    NumberNode({ integer: true }),
    { minLength: 3, maxLength: 3 }
  ), {
    default: () => [0, 0, 0]
  }))

  const Bounds = (integer?: boolean) => Opt(ChoiceNode([
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
  ]))

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
        value: ObjectNode({
          min_inclusive: NumberNode(config),
          max_exclusive: NumberNode(config)
        })
      },
      'minecraft:clamped_normal': {
        value: ObjectNode({
          min: NumberNode(),
          max: NumberNode(),
          mean: NumberNode(),
          deviation: NumberNode()
        })
      },
      'minecraft:trapezoid': {
        value: ObjectNode({
          min: NumberNode(),
          max: NumberNode(),
          plateau: NumberNode()
        })
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
        value: ObjectNode({
          min_inclusive: NumberNode({ integer: true, ...config }),
          max_inclusive: NumberNode({ integer: true, ...config })
        })
      },
      'minecraft:biased_to_bottom': {
        value: ObjectNode({
          min_inclusive: NumberNode({ integer: true, ...config }),
          max_inclusive: NumberNode({ integer: true, ...config })
        })
      },
      'minecraft:clamped': {
        value: ObjectNode({
          min_inclusive: NumberNode({ integer: true, ...config }),
          max_inclusive: NumberNode({ integer: true, ...config }),
          source: Reference('int_provider')
        })
      },
      'minecraft:clamped_normal': {
        value: ObjectNode({
          min_inclusive: NumberNode({ integer: true, ...config }),
          max_inclusive: NumberNode({ integer: true, ...config }),
          mean: NumberNode(),
          deviation: NumberNode()
        })
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

  ConditionCases = (entitySourceNode: INode<any> = StringNode({ enum: 'entity_source' })) => ({
    'minecraft:alternative': {
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
      chance: NumberNode({ min: 0, max: 1 })
    },
    'minecraft:random_chance_with_looting': {
      chance: NumberNode({ min: 0, max: 1 }),
      looting_multiplier: NumberNode()
    },
    'minecraft:reference': {
      name: StringNode({ validator: 'resource', params: { pool: '$predicate' } })
    },
    'minecraft:table_bonus': {
      enchantment: StringNode({ validator: 'resource', params: { pool: 'enchantment' } }),
      chances: ListNode(
        NumberNode({ min: 0, max: 1 })
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
      'minecraft:copy_name': {
        source: copySourceNode
      },
      'minecraft:copy_nbt': {
        source: Reference('nbt_provider'),
        ops: ListNode(
          ObjectNode({
            source: StringNode({ validator: 'nbt_path', params: { category: { getter: 'copy_source', path: ['pop', 'pop', 'pop', { push: 'source' }] } } }),
            target: StringNode({ validator: 'nbt_path', params: { category: 'minecraft:item' } }),
            op: StringNode({ enum: ['replace', 'append', 'merge'] })
          }, { context: 'nbt_operation' })
        )
      },
      'minecraft:copy_state': {
        block: StringNode({ validator: 'resource', params: { pool: 'block' } }),
        properties: ListNode(
          StringNode({ validator: 'block_state_key', params: { id: ['pop', 'pop', { push: 'block' }] } })
        )
      },
      'minecraft:enchant_randomly': {
        enchantments: Opt(ListNode(
          StringNode({ validator: 'resource', params: { pool: 'enchantment' } })
        ))
      },
      'minecraft:enchant_with_levels': {
        levels: Reference('number_provider'),
        treasure: Opt(BooleanNode())
      },
      'minecraft:exploration_map': {
        destination: Opt(Tag({ resource: '$worldgen/configured_structure_feature' })),
        decoration: Opt(StringNode({ enum: 'map_decoration' })),
        zoom: Opt(NumberNode({ integer: true })),
        search_radius: Opt(NumberNode({ integer: true })),
        skip_existing_chunks: Opt(BooleanNode())
      },
      'minecraft:fill_player_head': {
        entity: entitySourceNode
      },
      'minecraft:limit_count': {
        limit: Reference('int_range')
      },
      'minecraft:looting_enchant': {
        count: Reference('number_provider'),
        limit: Opt(NumberNode({ integer: true }))
      },
      'minecraft:set_attributes': {
        modifiers: ListNode(
          Reference('attribute_modifier')
        )
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
      'minecraft:set_contents': {
        type: StringNode({ validator: 'resource', params: { pool: 'block_entity_type' } }),
        entries: ListNode(
          Reference('loot_entry')
        )
      },
      'minecraft:set_count': {
        count: Reference('number_provider'),
        add: Opt(BooleanNode())
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
      'minecraft:set_loot_table': {
        type: StringNode({ validator: 'resource', params: { pool: 'block_entity_type' } }),
        name: StringNode({ validator: 'resource', params: { pool: '$loot_table' } }),
        seed: Opt(NumberNode({ integer: true }))
      },
      'minecraft:set_lore': {
        entity: Opt(entitySourceNode),
        lore: ListNode(
          Reference('text_component')
        ),
        replace: Opt(BooleanNode())
      },
      'minecraft:set_name': {
        entity: Opt(entitySourceNode),
        name: Opt(Reference('text_component'))
      },
      'minecraft:set_nbt': {
        tag: StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:item' } } })
      },
      'minecraft:set_potion': {
        id: StringNode({ validator: 'resource', params: { pool: 'potion' } })
      },
      'minecraft:set_stew_effect': {
        effects: Opt(ListNode(
          ObjectNode({
            type: StringNode({ validator: 'resource', params: { pool: 'mob_effect' } }),
            duration: Reference('number_provider')
          })
        ))
      }
    }
    const res: NestedNodeChildren = {}
    collections.get('loot_function_type').forEach(f => {
      res[f] = {...cases[f], ...conditions }
    })
    return res
  }

  DimensionTypePresets = (node: INode<any>) => ObjectOrPreset(
    StringNode({ validator: 'resource', params: { pool: '$dimension_type' } }),
    node,
    {
      'minecraft:overworld': DefaultDimensionType,
      'minecraft:the_nether': {
        name: 'minecraft:the_nether',
        ultrawarm: true,
        natural: false,
        shrunk: true,
        piglin_safe: true,
        respawn_anchor_works: true,
        bed_works: false,
        has_raids: false,
        has_skylight: false,
        has_ceiling: true,
        ambient_light: 0.1,
        fixed_time: 18000,
        logical_height: 128,
        effects: 'minecraft:the_nether',
        infiniburn: '#minecraft:infiniburn_nether',
        min_y: 0,
        height: 256,
      },
      'minecraft:the_end': {
        name: 'minecraft:the_end',
        ultrawarm: false,
        natural: false,
        shrunk: false,
        piglin_safe: false,
        respawn_anchor_works: false,
        bed_works: false,
        has_raids: true,
        has_skylight: false,
        has_ceiling: false,
        ambient_light: 0,
        fixed_time: 6000,
        logical_height: 256,
        effects: 'minecraft:the_end',
        infiniburn: '#minecraft:infiniburn_end',
        min_y: 0,
        height: 256,
      }
    }
  )

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
