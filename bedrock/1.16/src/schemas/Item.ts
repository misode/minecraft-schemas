import {
  BooleanNode,
  StringNode as RawStringNode,
  Mod,
  ObjectNode,
  SwitchNode,
  MapNode,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
  NodeChildren,
  NumberNode,
  ListNode,
  StringOrList,
} from '@mcschema/core'

export function initItemSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)

  const Components = (cases: NodeChildren) => 
    SwitchNode(Object.keys(cases).map(c => ({
      match: p => p.last() === c,
      node: cases[c]
    })))

  schemas.register('item', Mod(ObjectNode({
    format_version: StringNode(),
    'minecraft:item': ObjectNode({
      description: ObjectNode({
        identifier: StringNode({ validator: 'resource', params: { pool: 'item', isDefinition: true }}),
        category: Opt(StringNode()),
        is_experimental: Opt(BooleanNode())
      }),
      components: MapNode(
        StringNode({ validator: 'resource', params: { pool: [], allowUnknown: true } }),
        Components({
          'minecraft:max_stack_size': NumberNode({ integer: true }),
          'minecraft:max_damage': NumberNode({ integer: true }),
          'minecraft:use_duration': NumberNode({ integer: true }),
          'minecraft:stacked_by_data': BooleanNode(),
          'minecraft:armor': ObjectNode({
            protection: NumberNode(),
            texture_type: StringNode()
          }),
          'minecraft:block_placer': ObjectNode({
            block: StringNode({ validator: 'resource', params: { pool: 'block' }}),
            use_on: Opt(ListNode(
              StringNode({ validator: 'resource', params: { pool: 'block' }})
            ))
          }),
          'minecraft:cooldown': ObjectNode({
            duration: NumberNode(),
            category: StringNode()
          }),
          'minecraft:digger': ObjectNode({
            destroy_speed: NumberNode(),
            on_dig: StringNode(),
            use_efficiency: Opt(BooleanNode())
          }),
          'minecraft:display_name': ObjectNode({
            value: StringNode()
          }),
          'minecraft:durability': ObjectNode({
            max_durability: NumberNode(),
            damage_chance: NumberNode()
          }),
          'minecraft:dye_powder': ObjectNode({
            color: StringNode()
          }),
          'minecraft:entity_placer': ObjectNode({
            entity: StringNode({ validator: 'resource', params: { pool: 'entity_type' }}),
            use_on: Opt(ListNode(
              StringNode({ validator: 'resource', params: { pool: 'block' }})
            )),
            dispense_on: Opt(ListNode(
              StringNode({ validator: 'resource', params: { pool: 'block' }})
            ))
          }),
          'minecraft:food': ObjectNode({
            nutrition: NumberNode({ integer: true, min: 0 }),
            saturation_modifier: StringNode({ enum: ['low', 'poor', 'normal', 'good', 'supernatural'] }),
            using_converts_to: StringNode({ validator: 'resource', params: { pool: 'item' }}),
            can_always_eat: Opt(BooleanNode()),
            is_meat: Opt(BooleanNode()),
            on_consume: Opt(StringNode()),
            on_use_action: Opt(StringNode({ enum: ['chorus_teleport', 'suspicious_stew_effect'] })),
            on_use_range: Opt(ListNode(
              NumberNode()
            )),
            cooldown_type: Opt(StringNode()),
            cooldown_time: Opt(NumberNode({ integer: true })),
            effects: Opt(ListNode(
              ObjectNode({
                name: StringNode({ validator: 'resource', params: { pool: 'mob_effect' } }),
                chance: NumberNode({ min: 0, max: 1 }),
                duration: NumberNode({ integer: true, min: 0 }),
                amplifier: NumberNode({ integer: true, min: 0 })
              })
            )),
            remove_effects: Opt(ListNode(
              StringNode()
            ))
          }),
          'minecraft:fuel': ObjectNode({
            duration: NumberNode()
          }),
          'minecraft:icon': ObjectNode({
            texture: StringNode(),
            frame: NumberNode(),
            legacy_id: NumberNode()
          }),
          'minecraft:knockback_resistance': ObjectNode({
            protection: NumberNode()
          }),
          'minecraft:on_use': ObjectNode({
            on_use: StringNode()
          }),
          'minecraft:on_use_on': ObjectNode({
            on_use_on: StringNode()
          }),
          'minecraft:projectile': ObjectNode({
            projectile_entity: StringNode({ validator: 'resource', params: { pool: 'entity_type' } })
          }),
          'minecraft:repairable': ObjectNode({
            repair_items: ListNode(
              StringNode({ validator: 'resource', params: { pool: 'item' }})
            ),
            on_repaired: Opt(StringNode())
          }),
          'minecraft:shooter': ObjectNode({
            ammunition: StringNode(),
            launch_power_scale: Opt(NumberNode()),
            max_launch_power: Opt(NumberNode()),
            max_draw_duration: Opt(NumberNode()),
            charge_on_drag: Opt(BooleanNode()),
            scale_power_by_draw_duration: Opt(BooleanNode())
          }),
          'minecraft:throwable': ObjectNode({
            do_swing_animation: Opt(BooleanNode()),
            launch_power_scale: Opt(NumberNode()),
            max_draw_duration: Opt(NumberNode()),
            min_draw_duration: Opt(NumberNode()),
            scale_power_by_draw_duration: Opt(BooleanNode())
          }),
          'minecraft:weapon': ObjectNode({
            on_hit_block: Opt(StringNode()),
            on_hurt_entity: Opt(StringNode()),
            on_not_hurt_entity: Opt(StringNode())
          }),
          'minecraft:wearable': ObjectNode({
            dispensable: BooleanNode(),
            slot: StringNode({ enum: 'equipment_slot' })
          }),
          'minecraft:seed': ObjectNode({
            crop_result: StringNode({ validator: 'resource', params: { pool: 'block' } }),
            plant_at: Opt(StringOrList(
              StringNode({ validator: 'resource', params: { pool: 'block' } })
            ))
          })
        })
      )
    })
  }, { context: 'item' }), {
    default: () => ({
      format_version: '1.16.0'
    })
  }))
}
