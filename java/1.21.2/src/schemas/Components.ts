import {
  BooleanNode,
  Case,
  StringNode as RawStringNode,
  ListNode,
  MapNode,
  ObjectNode,
  Opt,
  Reference as RawReference,
  SchemaRegistry,
  ChoiceNode,
  CollectionRegistry,
  NumberNode,
  Switch,
  SwitchNode,
  INode,
  Mod,
  ModelPath,
} from '@mcschema/core'
import { Filterable, SizeLimitedString, Tag } from './Common'

export function initComponentsSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('custom_data_component', ChoiceNode([
    {
      type: 'string',
      node: StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:item', id: ['pop', 'pop', { push: 'item' }] } } }),
    },
    {
      type: 'object',
      node: ObjectNode({}) // TODO: any unsafe data
    },
  ], { context: 'custom_data' }))

  schemas.register('enchantments_component', ChoiceNode([
    {
      type: 'simple',
      match: () => true,
      node: MapNode(
        StringNode({ validator: 'resource', params: { pool: 'enchantment' } }),
        NumberNode({ integer: true, min: 0, max: 255 }),
      ),
      change: v => v.levels ?? {}
    },
    {
      type: 'full',
      match: v => typeof v === 'object' && typeof v?.levels === 'object',
      node: ObjectNode({
        levels: MapNode(
          StringNode({ validator: 'resource', params: { pool: 'enchantment' } }),
          NumberNode({ integer: true, min: 0, max: 255 }),
        ),
        show_in_tooltip: Opt(BooleanNode()),
      }),
      change: v => ({ levels: v ?? {} }),
      priority: 1,
    }
  ], { context: 'enchantments' }))

  schemas.register('adventure_mode_predicate', ChoiceNode([
    {
      type: 'simple',
      match: () => true,
      node: Reference('block_predicate'),
      change: v => typeof v === 'object' && Array.isArray(v?.predicates) && typeof v.predicates[0] === 'object' ? v.predicates[0] : {}
    },
    {
      type: 'full',
      match: v => typeof v === 'object' && Array.isArray(v?.predicates),
      node: ObjectNode({
        predicates: ListNode(
          Reference('block_predicate'),
          { minLength: 1 },
        ),
        show_in_tooltip: Opt(BooleanNode()),
      }),
      change: v => ({
        predicates: [typeof v === 'object' && v !== null ? v : {}],
      }),
      priority: 1,
    },
  ], { context: 'adventure_mode_predicate' }))

  schemas.register('attribute_modifiers_entry', ObjectNode({
    id: StringNode(),
    type: StringNode({ validator: 'resource', params: { pool: 'attribute' } }),
    amount: NumberNode(),
    operation: StringNode({ enum: 'attribute_modifier_operation' }),
    slot: Opt(StringNode({ enum: 'equipment_slot_group' })),
  }, { context: 'attribute_modifier' }))

  schemas.register('map_decoration', ObjectNode({
    type: StringNode({ enum: 'map_decoration' }),
    x: NumberNode(),
    z: NumberNode(),
    rotation: NumberNode(),
  }, { context: 'map_decoration' }))

  const MobEffectDetails = {
    amplifier: Opt(NumberNode({ integer: true, min: 0, max: 255 })),
    duration: Opt(NumberNode({ integer: true })),
    ambient: Opt(BooleanNode()),
    show_particles: Opt(BooleanNode()),
    show_icon: Opt(BooleanNode()),
    hidden_effect: Opt(Reference('mob_effect_details')) // recusive
  }

  schemas.register('mob_effect_details', ObjectNode({
    ...MobEffectDetails,
  }, { context: 'mob_effect_instance' } ))

  schemas.register('mob_effect_instance', ObjectNode({
    id: StringNode({ validator: 'resource', params: { pool: 'mob_effect' } }),
    ...MobEffectDetails,
  }, { context: 'mob_effect_instance' }))

  schemas.register('suspicious_stew_effect_instance', ObjectNode({
    id: StringNode({ validator: 'resource', params: { pool: 'mob_effect' } }),
    duration: NumberNode({ integer: true }),
  }, { context: 'suspicious_stew_effect_instance' }))

  schemas.register('firework_explosion', ObjectNode({
    shape: StringNode({ enum: 'firework_explosion_shape' }),
    colors: Opt(ListNode(
      NumberNode({ color: true }),
    )),
    fade_colors: Opt(ListNode(
      NumberNode({ color: true }),
    )),
    has_trail: Opt(BooleanNode()),
    has_twinkle: Opt(BooleanNode()),
  }, { context: 'firework_explosion' }))

  schemas.register('player_name', Mod(SizeLimitedString({ maxLength: 16 }), node => ({
    validate: (path, value, errors, options) => {
      value = node.validate(path, value, errors, options)
      if (typeof value === 'string' && value.split('').map(c => c.charCodeAt(0)).some(c => c <= 32 || c >= 127)) {
        errors.add(path, 'error.invalid_player_name')
      }
      return value
    }
  })))

  schemas.register('consume_effect', ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'consume_effect_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:apply_effects': {
        effects: ListNode(Reference('mob_effect_instance')),
        probability: Opt(NumberNode({ min: 0, max: 1 })),
      },
      'minecraft:remove_effects': {
        effects: Tag({ resource: 'mob_effect' })
      },
      'minecraft:teleport_randomly': {
        diameter: NumberNode({ min: 0 }),
      },
      'minecraft:play_sound': {
        sound: Reference('sound_event'),
      },
    }
  }))

  const Components: Record<string, INode> = {
    'minecraft:attribute_modifiers': ChoiceNode([
      {
        type: 'list',
        node: ListNode(
          Reference('attribute_modifiers_entry'),
        ),
        change: v => v.modifiers
      },
      {
        type: 'object',
        node: ObjectNode({
          modifiers: ListNode(
            Reference('attribute_modifiers_entry'),
          ),
          show_in_tooltip: Opt(BooleanNode()),
        }),
        change: v => ({ modifiers: v })
      }
    ], { context: 'data_component.attribute_modifiers' }),
    'minecraft:banner_patterns': ListNode(
      ObjectNode({
        pattern: ChoiceNode([
          {
            type: 'string',
            node: StringNode({ validator: 'resource', params: { pool: 'banner_pattern' } }),
          },
          {
            type: 'object',
            node: Reference('banner_pattern')
          },
        ]),
        color: StringNode({ enum: 'dye_color' }),
      }),
      { context: 'data_component.banner_patterns' },
    ),
    'minecraft:base_color': StringNode({ enum: 'dye_color' }),
    'minecraft:bees': ListNode(
      ObjectNode({
        entity_data: ObjectNode({
          // TODO: any unsafe data
        }),
        ticks_in_hive: NumberNode({ integer: true }),
        min_ticks_in_hive: NumberNode({ integer: true }),
      }),
      { context: 'data_component.bees' },
    ),
    'minecraft:block_entity_data': ObjectNode({
      id: StringNode({ validator: 'resource', params: { pool: 'block_entity_type' } }),
      // TODO: any unsafe data
    }, { context: 'data_component.block_entity_data' }),
    'minecraft:block_state': MapNode(
      StringNode(),
      StringNode(),
      { context: 'data_component.block_state' },
    ),
    'minecraft:bucket_entity_data': ObjectNode({
      // TODO: any unsafe data
    }, { context: 'data_component.bucket_entity_data' }),
    'minecraft:bundle_contents': ListNode(
      Reference('item_stack'),
      { context: 'data_component.bundle_contents', maxLength: 64 },
    ),
    'minecraft:can_break': Reference('adventure_mode_predicate'),
    'minecraft:can_place_on': Reference('adventure_mode_predicate'),
    'minecraft:charged_projectiles': ListNode(
      Reference('item_stack'),
      { context: 'data_component.charged_projectiles' },
    ),
    'minecraft:consumable': ObjectNode({
      consume_seconds: Opt(NumberNode({ min: 0 })),
      animation: Opt(StringNode({ enum: 'use_animation' })),
      sound: Opt(Reference('sound_event')),
      has_consume_particles: Opt(BooleanNode()),
      on_consume_effects: Opt(ListNode(Reference('consume_effect')))
    }),
    'minecraft:container': ListNode(
      ObjectNode({
        slot: NumberNode({ integer: true, min: 0, max: 255 }),
        item: Reference('item_stack'),
      }),
      { context: 'data_component.container', maxLength: 256 },
    ),
    'minecraft:container_loot': ObjectNode({
      loot_table: StringNode({ validator: 'resource', params: { pool: '$loot_table' } }),
      seed: Opt(NumberNode({ integer: true })),
    }, { context: 'data_component.container_loot' }),
    'minecraft:custom_data': Reference('custom_data_component'),
    'minecraft:custom_model_data': NumberNode({ integer: true }),
    'minecraft:custom_name': StringNode(), // text component
    'minecraft:damage': NumberNode({ integer: true, min: 0 }),
    'minecraft:damage_resistant': ObjectNode({
      types: StringNode({ validator: 'resource', params: { pool: '$damage_type', requireTag: true } })
    }),
    'minecraft:death_protection': ObjectNode({
      death_effects: Opt(ListNode(Reference('consume_effect'))),
    }),
    'minecraft:debug_stick_state': MapNode(
      StringNode({ validator: 'resource', params: { pool: 'block' } }),
      StringNode(), // TODO: block state key validation
      { context: 'data_component.debug_stick_state' },
    ),
    'minecraft:dyed_color': ChoiceNode([
      {
        type: 'number',
        node: NumberNode({ color: true }),
        change: v => v.rgb
      },
      {
        type: 'object',
        node: ObjectNode({
          rgb: NumberNode({ color: true }),
          show_in_tooltip: Opt(BooleanNode()),
        }),
        change: v => ({ rgb: v })
      }
    ], { context: 'data_component.dyed_color' }),
    'minecraft:enchantable': ObjectNode({
      value: NumberNode({ integer: true, min: 1 }),
    }),
    'minecraft:enchantment_glint_override': BooleanNode(),
    'minecraft:enchantments': Reference('enchantments_component'),
    'minecraft:entity_data': ObjectNode({
      id: StringNode({ validator: 'resource', params: { pool: 'entity_type' } }),
      // TODO: any unsafe data
    }, { context: 'data_component.entity_data' }),
    'minecraft:equippable': ObjectNode({
      slot: StringNode({ enum: 'equipment_slot' }),
      equip_sound: Opt(Reference('sound_event')),
      model: Opt(StringNode()),
      allowed_entities: Opt(Tag({ resource: 'entity_type' })),
      dispensable: Opt(BooleanNode()),
      swappable: Opt(BooleanNode()),
      damage_on_hurt: Opt(BooleanNode()),
    }),
    'minecraft:firework_explosion': Reference('firework_explosion'),
    'minecraft:fireworks': ObjectNode({
      flight_duration: Opt(NumberNode({ integer: true, min: 0, max: 255 })),
      explosions: ListNode(
        Reference('firework_explosion'),
        { maxLength: 256 },
      ),
    }, { context: 'data_component.fireworks' }),
    'minecraft:food': ObjectNode({
      nutrition: NumberNode({ integer: true, min: 0 }),
      saturation: NumberNode(),
      can_always_eat: Opt(BooleanNode()),
    }, { context: 'data_component.food' }),
    'minecraft:glider': ObjectNode({}),
    'minecraft:hide_additional_tooltip': ObjectNode({}),
    'minecraft:hide_tooltip': ObjectNode({}),
    'minecraft:instrument': ChoiceNode([
      {
        type: 'string',
        node: StringNode({ validator: 'resource', params: { pool: 'instrument' } }),
      },
      {
        type: 'object',
        node: Reference('instrument'),
      },
    ], { context: 'data_component.instrument' }),
    'minecraft:intangible_projectile': ObjectNode({}),
    'minecraft:item_model': StringNode(),
    'minecraft:item_name': StringNode(), // text component
    'minecraft:jukebox_playable': ObjectNode({
      song: ChoiceNode([
        {
          type: 'string',
          node: StringNode({ validator: 'resource', params: { pool: 'jukebox_song' } }),
        },
        {
          type: 'object',
          node: Reference('jukebox_song'),
        },
      ]),
      show_in_tooltip: Opt(BooleanNode()),
    }, { context: 'data_component.jukebox_playable' }),
    'minecraft:lock': StringNode(),
    'minecraft:lodestone_tracker': ObjectNode({
      target: Opt(ObjectNode({
        dimension: StringNode({ validator: 'resource', params: { pool: '$dimension' } }),
        pos: Reference('block_pos'),
      })),
      tracked: Opt(BooleanNode()),
    }, { context: 'data_component.lodestone_tracker' }),
    'minecraft:lore': ListNode(
      StringNode(), // text component
      { context: 'data_component.lore', maxLength: 256 },
    ),
    'minecraft:map_color': NumberNode({ color: true }),
    'minecraft:map_decorations': MapNode(
      StringNode(),
      Reference('map_decoration'),
      { context: 'data_component.map_decorations' },
    ),
    'minecraft:map_id': NumberNode({ integer: true }),
    'minecraft:max_damage': NumberNode({ integer: true, min: 1 }),
    'minecraft:max_stack_size': NumberNode({ integer: true, min: 0, max: 99 }),
    'minecraft:note_block_sound': StringNode({ validator: 'resource', params: { pool: [], allowUnknown: true } }),
    'minecraft:ominous_bottle_amplifier': NumberNode({ integer: true, min: 0, max: 4 }),
    'minecraft:pot_decorations': ListNode(
      StringNode({ validator: 'resource', params: { pool: 'item' } }),
      { context: 'data_component.pot_decorations', maxLength: 4 },
    ),
    'minecraft:potion_contents': ChoiceNode([
      {
        type: 'string',
        node: StringNode({ validator: 'resource', params: { pool: 'potion' } }),
        change: v => v.potion
      },
      {
        type: 'object',
        node: ObjectNode({
          potion: Opt(StringNode({ validator: 'resource', params: { pool: 'potion' } })),
          custom_color: Opt(NumberNode({ color: true })),
          custom_name: Opt(StringNode()),
          custom_effects: Opt(ListNode(
            Reference('mob_effect_instance'),
          )),
        }),
        change: v => ({ potion: v})
      }
    ], { context: 'data_component.potion_contents' }),
    'minecraft:profile': ChoiceNode([
      {
        type: 'string',
        node: Reference('player_name'),
        change: v => v.name
      },
      {
        type: 'object',
        node: ObjectNode({
          name: Opt(Reference('player_name')),
          id: Opt(ListNode(
            NumberNode({ integer: true }),
            { minLength: 4, maxLength: 4 },
          )),
          properties: Opt(ChoiceNode([
            {
              type: 'list',
              node: ListNode(ObjectNode({
                name: StringNode(),
                value: StringNode(),
                signature: Opt(StringNode()),
              })),
              change: v => {
                const result: Record<string, string>[] = []
                if (typeof v !== 'object' || v === null) return result
                for (const [name, values] of Object.entries(v)) {
                  if (!Array.isArray(values)) continue
                  result.push(...values.map(value => ({ name, value })))
                }
                return result
              }
            },
            {
              type: 'object',
              node: MapNode(
                StringNode(),
                ListNode(StringNode()),
              ),
              change: v => {
                const result: Record<string, string[]> = {}
                for (const e of Array.isArray(v) ? v : []) {
                  if (typeof e !== 'object' || e === null) continue
                  result[e.name ?? ''] = [...(result[e.name ?? ''] ?? []), e.value ?? '']
                }
                return result
              },
            }
          ])),
        }),
        change: v => ({ name: v })
      }
    ], { context: 'data_component.profile' }),
    'minecraft:rarity': StringNode({ enum: 'rarity' }),
    'minecraft:recipes': ListNode(
      StringNode({ validator: 'resource', params: { pool: '$recipe' } }),
      { context: 'data_component.recipes' },
    ),
    'minecraft:repair_cost': NumberNode({ integer: true, min: 0 }),
    'minecraft:repairable': ObjectNode({
      items: Tag({ resource: 'item' }),
    }),
    'minecraft:stored_enchantments': Reference('enchantments_component'),
    'minecraft:suspicious_stew_effects': ListNode(
      Reference('suspicious_stew_effect_instance'),
      { context: 'data_component.suspicious_stew_effects' },
    ),
    'minecraft:tool': ObjectNode({
      rules: ListNode(
        ObjectNode({
          blocks: Tag({ resource: 'block' }),
          speed: Opt(NumberNode({ min: 1 })),
          correct_for_drops: Opt(BooleanNode()),
        }),
      ),
      default_mining_speed: Opt(NumberNode()),
      damage_per_block: Opt(NumberNode({ integer: true, min: 0 })),
    }),
    'minecraft:tooltip_style': StringNode(),
    'minecraft:trim': ObjectNode({
      material: ChoiceNode([
        {
          type: 'string',
          node: StringNode({ validator: 'resource', params: { pool: '$trim_material' } }),
        },
        {
          type: 'object',
          node: Reference('trim_material'),
        },
      ]),
      pattern: ChoiceNode([
        {
          type: 'string',
          node: StringNode({ validator: 'resource', params: { pool: '$trim_pattern' } }),
        },
        {
          type: 'object',
          node: Reference('trim_pattern'),
        },
      ]),
      show_in_tooltip: Opt(BooleanNode()),
    }, { context: 'data_component.trim' }),
    'minecraft:unbreakable': ObjectNode({
      show_in_tooltip: Opt(BooleanNode())
    }, { context: 'data_component.unbreakable' }),
    'minecraft:use_cooldown': ObjectNode({
      seconds: NumberNode({ min: 0 }),
      cooldown_group: StringNode(),
    }),
    'minecraft:use_remainder': Reference('item_stack'),
    'minecraft:writable_book_content': ObjectNode({
      pages: Opt(ListNode(
        Filterable(SizeLimitedString({ maxLength: 1024 })),
      )),
    }, { context: 'data_component.writable_book_content' }),
    'minecraft:written_book_content': ObjectNode({
      title: SizeLimitedString({ maxLength: 32 }),
      author: StringNode(),
      generation: Opt(NumberNode({ integer: true, min: 0, max: 3 })),
      pages: Opt(ListNode(
        Filterable(SizeLimitedString({ maxLength: 32767 })), // text component
      )),
      resolved: Opt(BooleanNode()),
    }, { context: 'data_component.written_book_content' }),
  }

  const keyMatches = (key: string) => (path: ModelPath) => {
    let last = path.last().toString()
    if (!last.startsWith('minecraft:')) last = 'minecraft:' + last
    return last === key
  }

  schemas.register('data_component_predicate', MapNode(
    StringNode({ validator: 'resource', params: { pool: 'data_component_type' } }),
    SwitchNode([
      ...Object.entries(Components).map(([key, value]) => ({
        match: keyMatches(key),
        node: value,
      })),
      {
        match: () => true,
        node: ObjectNode({}), // default for unknown components
      },
    ]),
    { context: 'data_component_predicate' }
  ))

  schemas.register('data_component_patch', MapNode(
    StringNode({ enum: [
      ...collections.get('data_component_type'),
      ...collections.get('data_component_type').map(k => '!' + k),
    ] }),
    SwitchNode([
      {
        match: (path: ModelPath) => path.last().toString().startsWith('!'),
        node: ObjectNode({}),
      },
      ...Object.entries(Components).map(([key, value]) => ({
        match: keyMatches(key),
        node: value,
      })),
      {
        match: () => true,
        node: ObjectNode({}), // default for unknown components
      },
    ]),
    { context: 'data_component_patch' }
  ))
}
