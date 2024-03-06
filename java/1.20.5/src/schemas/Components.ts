import {
  BooleanNode,
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
  SwitchNode,
  INode,
  Mod,
} from '@mcschema/core'

export function initComponentsSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('enchantments_component', ObjectNode({
    levels: MapNode(
      StringNode({ validator: 'resource', params: { pool: 'enchantment' } }),
      NumberNode({ integer: true, min: 0, max: 255 }),
    ),
    show_in_tooltip: Opt(BooleanNode()),
  }, { context: 'enchantments' }))

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

  schemas.register('map_decoration', ObjectNode({
    type: StringNode({ enum: 'map_decoration' }),
    x: NumberNode(),
    z: NumberNode(),
    rotation: NumberNode(),
  }, { context: 'map_decoration' }))

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

  function Filterable(node: INode) {
    return ChoiceNode([
      {
        type: 'simple',
        match: () => true,
        node: node,
      },
      {
        type: 'filtered',
        match: v => typeof v === 'object' && v !== null,
        priority: 1,
        node: ObjectNode({
          text: node,
          filtered: Opt(node),
        }),
      },
    ], { context: 'filterable' })
  }

  function SizeLimitedString({ minLength, maxLength }: { minLength?: number, maxLength?: number}) {
    return Mod(StringNode(), node => ({
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
  }

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

  const Components: Record<string, INode> = {
    'minecraft:damage': NumberNode({ integer: true, min: 0 }),
    'minecraft:unbreakable': ObjectNode({
      show_in_tooltip: Opt(BooleanNode())
    }, { context: 'data_component.unbreakable' }),
    'minecraft:custom_name': StringNode(), // text component
    'minecraft:lore': ListNode(
      StringNode(), // text component
      { context: 'data_component.lore', maxLength: 256 },
    ),
    'minecraft:enchantments': Reference('enchantments_component'),
    'minecraft:can_place_on': Reference('adventure_mode_predicate'),
    'minecraft:can_break': Reference('adventure_mode_predicate'),
    'minecraft:attribute_modifiers': ObjectNode({
      modifiers: ListNode(
        ObjectNode({
          type: StringNode({ validator: 'resource', params: { pool: 'attribute' } }),
          uuid: StringNode({ validator: 'uuid' }),
          name: StringNode(),
          amount: NumberNode(),
          operation: StringNode({ enum: 'attribute_modifier_operation' }),
          slot: Opt(StringNode({ enum: 'equipment_slot_group' })),
        }, { context: 'attribute_modifier' }),
      ),
      show_in_tooltip: Opt(BooleanNode()),
    }, { context: 'data_component.attribute_modifiers' }),
    'minecraft:custom_model_data': NumberNode({ integer: true }),
    'minecraft:hide_additional_tooltip': ObjectNode({}),
    'minecraft:repair_cost': NumberNode({ integer: true, min: 0 }),
    'minecraft:enchantment_glint_override': BooleanNode(),
    'minecraft:intangible_projectile': ObjectNode({}),
    'minecraft:stored_enchantments': Reference('enchantments_component'),
    'minecraft:dyed_color': ObjectNode({
      rgb: NumberNode({ color: true }),
      show_in_tooltip: Opt(BooleanNode()),
    }, { context: 'data_component.dyed_color' }),
    'minecraft:map_color': NumberNode({ color: true }),
    'minecraft:map_id': NumberNode({ integer: true }),
    'minecraft:map_decorations': MapNode(
      StringNode(),
      Reference('map_decoration'),
      { context: 'data_component.map_decorations' },
    ),
    'minecraft:charged_projectiles': ListNode(
      Reference('item_stack'),
      { context: 'data_component.charged_projectiles' },
    ),
    'minecraft:bundle_contents': ListNode(
      Reference('item_stack'),
      { context: 'data_component.bundle_contents', maxLength: 64 },
    ),
    'minecraft:potion_contents': ObjectNode({
      potion: Opt(StringNode({ validator: 'resource', params: { pool: 'potion' } })),
      custom_color: Opt(NumberNode({ color: true })),
      custom_effects: Opt(ListNode(
        Reference('mob_effect_instance'),
      )),
    }, { context: 'data_component.potion_contents' }),
    'minecraft:suspicious_stew_effects': ListNode(
      Reference('suspicious_stew_effect_instance'),
      { context: 'data_component.suspicious_stew_effects' },
    ),
    'minecraft:writable_book_content': ObjectNode({
      pages: Opt(ListNode(
        Filterable(SizeLimitedString({ maxLength: 1024 })),
        { maxLength: 100 },
      )),
    }, { context: 'data_component.writable_book_content' }),
    'minecraft:written_book_content': ObjectNode({
      title: SizeLimitedString({ maxLength: 32 }),
      author: StringNode(),
      generation: Opt(NumberNode({ integer: true, min: 0, max: 3 })),
      pages: Opt(ListNode(
        Filterable(SizeLimitedString({ maxLength: 32767 })), // text component
        { maxLength: 100 },
      )),
      resolved: Opt(BooleanNode()),
    }, { context: 'data_component.written_book_content' }),
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
    'minecraft:debug_stick_state': MapNode(
      StringNode({ validator: 'resource', params: { pool: 'block' } }),
      StringNode(), // TODO: block state key validation
      { context: 'data_component.debug_stick_state' },
    ),
    'minecraft:entity_data': ObjectNode({
      id: StringNode({ validator: 'resource', params: { pool: 'entity_type' } }),
      // TODO: any unsafe data
    }, { context: 'data_component.entity_data' }),
    'minecraft:bucket_entity_data': ObjectNode({
      // TODO: any unsafe data
    }, { context: 'data_component.bucket_entity_data' }),
    'minecraft:block_entity_data': ObjectNode({
      id: StringNode({ validator: 'resource', params: { pool: 'block_entity_type' } }),
      // TODO: any unsafe data
    }, { context: 'data_component.block_entity_data' }),
    'minecraft:instrument': StringNode({ validator: 'resource', params: { pool: 'instrument' } }),
    'minecraft:recipes': ListNode(
      StringNode({ validator: 'resource', params: { pool: '$recipe' } }),
      { context: 'data_component.recipes' },
    ),
    'minecraft:lodestone_tracker': ObjectNode({
      tracker: Opt(ObjectNode({
        dimension: StringNode({ validator: 'resource', params: { pool: '$dimension' } }),
        pos: Reference('block_pos'),
      })),
      tracked: Opt(BooleanNode()),
    }, { context: 'data_component.lodestone_tracker' }),
    'minecraft:firework_explosion': Reference('firework_explosion'),
    'minecraft:fireworks': ObjectNode({
      flight_duration: Opt(NumberNode({ integer: true, min: 0, max: 255 })),
      explosions: ListNode(
        Reference('firework_explosion'),
        { maxLength: 256 },
      ),
    }, { context: 'data_component.fireworks' }),
    'minecraft:profile': ObjectNode({
      name: Opt(Mod(SizeLimitedString({ maxLength: 16 }), node => ({
        validate: (path, value, errors, options) => {
          value = node.validate(path, value, errors, options)
          if (typeof value === 'string' && !value.split('').map(c => c.charCodeAt(0)).some(c => c <= 32 || c >= 127)) {
            errors.add(path, 'error.invalid_player_name')
          }
          return value
        }
      }))),
      id: ListNode(
        NumberNode({ integer: true }),
        { minLength: 4, maxLength: 4 },
      ),
      properties: MapNode( // TODO
        StringNode(),
        StringNode(),
      ),
    }, { context: 'data_component.profile' }),
    'minecraft:note_block_sound': StringNode({ validator: 'resource', params: { pool: [], allowUnknown: true } }),
    'minecraft:banner_patterns': ListNode(
      ObjectNode({
        pattern: StringNode({ validator: 'resource', params: { pool: 'banner_pattern' } }),
        color: StringNode({ enum: 'dye_color' }),
      }),
      { context: 'data_component.banner_patterns' },
    ),
    'minecraft:base_color': StringNode({ enum: 'dye_color' }),
    'minecraft:pot_decorations': ListNode(
      StringNode({ validator: 'resource', params: { pool: 'item' } }),
      { context: 'data_component.pot_decorations', maxLength: 4 },
    ),
    'minecraft:container': ListNode(
      ObjectNode({
        slot: NumberNode({ integer: true, min: 0, max: 255 }),
        item: Reference('item_stack'),
      }),
      { context: 'data_component.container', maxLength: 256 },
    ),
    'minecraft:block_state': MapNode(
      StringNode(),
      StringNode(),
      { context: 'data_component.block_state' },
    ),
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
    'minecraft:lock': StringNode(),
    'minecraft:container_loot': ObjectNode({
      loot_table: StringNode({ validator: 'resource', params: { pool: '$loot_table' } }),
      seed: Opt(NumberNode({ integer: true })),
    }, { context: 'data_component.container_loot' }),
  }

  schemas.register('data_component_predicate', MapNode(
    StringNode({ validator: 'resource', params: { pool: 'data_component_type' } }),
    SwitchNode([
      ...Object.entries(Components).map(([key, value]) => ({
        match: (path: any) => {
          let last = path.last()
          if (typeof last !== 'string') return false
          if (!last.startsWith('minecraft:')) last = 'minecraft:' + last
          return last === key
        },
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
      ...Object.entries(Components).map(([key, value]) => ({
        match: (path: any) => {
          let last = path.last()
          if (typeof last !== 'string') return false
          if (last.startsWith('!')) last = last.slice(1)
          if (!last.startsWith('minecraft:')) last = 'minecraft:' + last
          return last === key
        },
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
