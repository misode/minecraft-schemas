import {
  StringNode as RawStringNode,
  Reference as RawReference,
  Mod,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  NumberNode,
  Opt,
  ListNode,
  MapNode,
  SwitchNode,
  INode,
  ModelPath,
  ObjectOrList,
  Switch,
  Case,
  BooleanNode
} from '@mcschema/core'
import { FloatProvider, Tag } from './Common'

export function initEnchantmentSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('enchantment_value_effect', ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'enchantment_value_effect_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:add': {
        value: Reference('level_based_value'),
      },
      'minecraft:all_of': {
        effects: ListNode(
          Reference('enchantment_value_effect')
        ),
      },
      'minecraft:multiply': {
        factor: Reference('level_based_value'),
      },
      'minecraft:remove_binomial': {
        chance: Reference('level_based_value'),
      },
      'minecraft:set': {
        value: Reference('level_based_value'),
      },
    },
  }, { context: 'enchantment_value_effect' }))

  const ParticlePositionSource = ObjectNode({
    type: StringNode({ enum: ['entity_position', 'in_bounding_box'] }),
    offset: Opt(NumberNode()),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'in_bounding_box': {
        scale: Opt(NumberNode({ min: 0 })) // TODO: 0 is not valid
      }
    },
  }, { context: 'particle_position_source' })

  const ParticleVelocitySource = ObjectNode({
    base: Opt(Reference('float_provider')),
    movement_scale: Opt(NumberNode()),
  }, { context: 'particle_velocity_source' })

  const attributeEffectFields = {
    id: StringNode(),
    attribute: StringNode({ validator: 'resource', params: { pool: 'attribute' } }),
    amount: Reference('level_based_value'),
    operation: StringNode({ enum: 'attribute_modifier_operation' }),
  }

  const SharedEffects = {
    'minecraft:apply_mob_effect': {
      to_apply: Tag({ resource: 'mob_effect' }),
      min_duration: Reference('level_based_value'),
      max_duration: Reference('level_based_value'),
      min_amplifier: Reference('level_based_value'),
      max_amplifier: Reference('level_based_value'),
    },
    'minecraft:damage_entity': {
      damage_type: StringNode({ validator: 'resource', params: { pool: '$damage_type' }}),
      min_damage: Reference('level_based_value'),
      max_damage: Reference('level_based_value'),
    },
    'minecraft:change_item_damage': {
      amount: Reference('level_based_value'),
    },
    'minecraft:explode': {
      damage_type: Opt(StringNode({ validator: 'resource', params: { pool: '$damage_type' }})),
      radius: Reference('level_based_value'),
      offset: Opt(Reference('vec3')),
      block_interaction: StringNode({ enum: 'explosion_interaction' }),
      small_particle: Reference('particle'),
      large_particle: Reference('particle'),
      sound: Reference('sound_event'),
      immune_blocks: Opt(Tag({ resource: 'block' })),
      knockback_multiplier: Opt(Reference('level_based_value')),
      attribute_to_user: Opt(BooleanNode()),
      create_fire: Opt(BooleanNode()),
    },
    'minecraft:ignite': {
      duration: Reference('level_based_value'),
    },
    'minecraft:play_sound': {
      sound: Reference('sound_event'),
      volume: FloatProvider({ min: 1e-5, max: 10 }),
      pitch: FloatProvider({ min: 1e-5, max: 2 }),
    },
    'minecraft:replace_block': {
      block_state: Reference('block_state_provider'),
      predicate: Opt(Reference('block_predicate_worldgen')),
      offset: Opt(Reference('block_pos')),
      trigger_game_event: Opt(StringNode({ validator: 'resource', params: { pool: 'game_event' } })),
    },
    'minecraft:replace_disk': {
      block_state: Reference('block_state_provider'),
      predicate: Opt(Reference('block_predicate_worldgen')),
      radius: Reference('level_based_value'),
      height: Reference('level_based_value'),
      offset: Opt(Reference('block_pos')),
      trigger_game_event: Opt(StringNode({ validator: 'resource', params: { pool: 'game_event' } })),
    },
    'minecraft:run_function': {
      function: StringNode(),
    },
    'minecraft:set_block_properties': {
      properties: MapNode(
        StringNode(),
        StringNode(),
      ),
      offset: Opt(Reference('block_pos')),
      trigger_game_event: Opt(StringNode({ validator: 'resource', params: { pool: 'game_event' } })),
    },
    'minecraft:spawn_particles': {
      particle: Reference('particle'),
      horizontal_position: ParticlePositionSource,
      vertical_position: ParticlePositionSource,
      horizontal_velocity: ParticleVelocitySource,
      vertical_velocity: ParticleVelocitySource,
      speed: Reference('float_provider'),
    },
    'minecraft:summon_entity': {
      entity: Tag({ resource: 'entity_type' }),
      join_team: Opt(BooleanNode()),
    },
  }

  schemas.register('enchantment_location_effect', ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'enchantment_location_based_effect_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      ...SharedEffects,
      'minecraft:all_of': {
        effects: ListNode(
          Reference('enchantment_location_effect')
        ),
      },
      'minecraft:attribute': {
        ...attributeEffectFields,
      }
    }
  }, { context: 'enchantment_effect' }))

  schemas.register('enchantment_entity_effect', ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'enchantment_entity_effect_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      ...SharedEffects,
      'minecraft:all_of': {
        effects: ListNode(
          Reference('enchantment_entity_effect')
        ),
      },
    }
  }, { context: 'enchantment_effect' }))

  const ConditionalEffect = (effect: INode) => ObjectNode({
    effect: effect,
    requirements: Opt(ObjectOrList(
      Reference('condition'), { choiceContext: 'condition' }
    )),
  })

  const TargetedConditionalEffect = (effect: INode, equipmentDrops?: boolean) => ObjectNode({
    ...equipmentDrops ? {
        enchanted: StringNode({ enum: ['attacker', 'victim'] })
      } : {
        enchanted: StringNode({ enum: 'enchantment_target' }),
        affected: StringNode({ enum: 'enchantment_target' }),
      },
    effect: effect,
    requirements: Opt(ObjectOrList(
      Reference('condition'), { choiceContext: 'condition' }
    )),
  })

  const EffectComponents: Record<string, INode> = {
    'minecraft:damage_protection': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:damage_immunity': ListNode(
      ConditionalEffect(ObjectNode({}))
    ),
    'minecraft:damage': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:smash_damage_per_fallen_block': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:knockback': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:armor_effectiveness': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:post_attack': ListNode(
      TargetedConditionalEffect(Reference('enchantment_entity_effect'))
    ),
    'minecraft:hit_block': ListNode(
      ConditionalEffect(Reference('enchantment_entity_effect'))
    ),
    'minecraft:item_damage': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:attributes': ListNode(
      ObjectNode(attributeEffectFields),
    ),
    'minecraft:equipment_drops': ListNode(
      TargetedConditionalEffect(Reference('enchantment_value_effect'), true)
    ),
    'minecraft:location_changed': ListNode(
      ConditionalEffect(Reference('enchantment_location_effect'))
    ),
    'minecraft:tick': ListNode(
      ConditionalEffect(Reference('enchantment_entity_effect'))
    ),
    'minecraft:ammo_use': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:projectile_piercing': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:projectile_spawned': ListNode(
      ConditionalEffect(Reference('enchantment_entity_effect'))
    ),
    'minecraft:projectile_spread': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:projectile_count': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:crossbow_charge_time': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:trident_return_acceleration': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:fishing_time_reduction': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:fishing_luck_bonus': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:block_experience': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:mob_experience': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:trident_spin_attack_strength': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:repair_with_xp': ListNode(
      ConditionalEffect(Reference('enchantment_value_effect'))
    ),
    'minecraft:crossbow_charging_sounds': ListNode(
      ObjectNode({
        start: Opt(Reference('sound_event')),
        mid: Opt(Reference('sound_event')),
        end: Opt(Reference('sound_event')),
      }),
    ),
    'minecraft:trident_sound': ListNode(
      Reference('sound_event'),
    ),
    'minecraft:prevent_equipment_drop': ObjectNode({}),
    'minecraft:prevent_armor_change': ObjectNode({}),
  }

  const keyMatches = (key: string) => (path: ModelPath) => {
    let last = path.last().toString()
    if (!last.startsWith('minecraft:')) last = 'minecraft:' + last
    return last === key
  }

  schemas.register('enchantment_cost', ObjectNode({
    base: NumberNode({ integer: true }),
    per_level_above_first: NumberNode({ integer: true }),
  }, { context: 'enchantment_cost' }))

	schemas.register('enchantment', Mod(ObjectNode({
    description: Reference('text_component'),
    exclusive_set: Opt(Tag({ resource: 'enchantment' })),
    supported_items: Tag({ resource: 'item' }),
    primary_items: Opt(Tag({ resource: 'item' })),
    weight: NumberNode({ integer: true, min: 1, max: 1024 }),
    max_level: NumberNode({ integer: true, min: 1, max: 255 }),
    min_cost: Reference('enchantment_cost'),
    max_cost: Reference('enchantment_cost'),
    anvil_cost: NumberNode({ integer: true, min: 0 }),
    slots: ListNode(
      StringNode({ enum: 'equipment_slot_group' })
    ),
    effects: Opt(MapNode(
      StringNode({ validator: 'resource', params: { pool: 'enchantment_effect_component_type' }}),
      SwitchNode([
        ...Object.entries(EffectComponents).map(([key, value]) => ({
          match: keyMatches(key),
          node: value,
        })),
        {
          match: () => true,
          node: ObjectNode({}), // default for unknown components
        },
      ]),
    ))
	}, { context: 'enchantment' }), {
		default: () => ({

		})
	}))

  schemas.register('enchantment_provider', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'enchantment_provider_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:by_cost': {
        enchantments: Tag({ resource: 'enchantment' }),
        cost: Reference('int_provider'),
      },
      'minecraft:by_cost_with_difficulty': {
        enchantments: Tag({ resource: 'enchantment' }),
        min_cost: NumberNode({ integer: true, min: 1 }),
        max_cost_span: NumberNode({ integer: true, min: 0 }),
      },
      'minecraft:single': {
        enchantment: StringNode({ validator: 'resource', params: { pool: 'enchantment' } }),
        level: Reference('int_provider'),
      }
    },
  }, { context: 'enchantment_provider' }), {
    default: () => ({

    })
  }))
}
