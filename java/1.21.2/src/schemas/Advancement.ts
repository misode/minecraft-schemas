import {
  BooleanNode,
  Case,
  ChoiceNode,
  StringNode as RawStringNode,
  ListNode,
  MapNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'

export function initAdvancementSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  const EntityPredicate = ChoiceNode([
      {
        type: 'object',
        node: Opt(Reference('entity_predicate')),
        change: v => v[0]?.predicate ?? ({})
      },
      {
        type: 'list',
        node: ListNode(Reference('condition')),
        change: v => [{
          condition: 'minecraft:entity_properties',
          predicate: v
        }]
      }
    ], { context: 'conditions' })

  schemas.register('advancement', Mod(ObjectNode({
    display: Opt(Mod(ObjectNode({
      icon: Reference('item_stack'),
      title: Reference('text_component'),
      description: Reference('text_component'),
      background: Opt(StringNode()),
      frame: Opt(StringNode({ enum: ['task', 'challenge', 'goal'] })),
      show_toast: Opt(BooleanNode()),
      announce_to_chat: Opt(BooleanNode()),
      hidden: Opt(BooleanNode())
    }), {
      default: () => ({
        icon: {
          id: 'minecraft:stone'
        },
        title: '',
        description: ''
      })
    })),
    parent: Opt(StringNode({ validator: 'resource', params: { pool: '$advancement' } })),
    criteria: MapNode(
      StringNode(),
      Reference('advancement_criteria')
    ),
    requirements: Opt(ListNode(
      ListNode(
        StringNode() // TODO: add validation
      )
    )),
    rewards: Opt(ObjectNode({
      function: Opt(StringNode({ validator: 'resource', params: { pool: '$function' } })),
      loot: Opt(ListNode(
        StringNode({ validator: 'resource', params: { pool: '$loot_table' } })
      )),
      recipes: Opt(ListNode(
        StringNode({ validator: 'resource', params: { pool: '$recipe' } })
      )),
      experience: Opt(NumberNode({ integer: true }))
    })),
    sends_telemetry_event: Opt(BooleanNode()),
  }, { context: 'advancement' }), {
    default: () => ({
      criteria: {
        requirement: {
          trigger: 'minecraft:location'
        }
      }
    })
  }))

  schemas.register('advancement_criteria', ObjectNode({
    trigger: StringNode({ validator: 'resource', params: { pool: 'trigger_type' } }),
    conditions: Opt(ObjectNode({
      player: Mod(EntityPredicate, {
        enabled: path => path.pop().push('trigger').get() !== 'minecraft:impossible'
      }),
      [Switch]: ['pop', { push: 'trigger' }],
      [Case]: {
        'minecraft:allay_drop_item_on_block': {
          location: EntityPredicate
        },
        'minecraft:any_block_use': {
          location: EntityPredicate
        },
        'minecraft:bee_nest_destroyed': {
          block: Opt(StringNode({ validator: 'resource', params: { pool: 'block' } })),
          num_bees_inside: Opt(Reference('int_bounds')),
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:bred_animals': {
          parent: EntityPredicate,
          partner: EntityPredicate,
          child: EntityPredicate
        },
        'minecraft:brewed_potion': {
          potion: Opt(StringNode({ validator: 'resource', params: { pool: 'potion' } }))
        },
        'minecraft:changed_dimension': {
          from: Opt(StringNode({ validator: 'resource', params: { pool: '$dimension' } })),
          to: Opt(StringNode({ validator: 'resource', params: { pool: '$dimension' } }))
        },
        'minecraft:channeled_lightning': {
          victims: Opt(ListNode(
            EntityPredicate
          ))
        },
        'minecraft:construct_beacon': {
          level: Opt(Reference('int_bounds'))
        },
        'minecraft:consume_item': {
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:crafter_recipe_crafted': {
          recipe_id: StringNode({ validator: 'resource', params: { pool: '$recipe' } }),
          ingredients: Opt(ListNode(
            Reference('item_predicate')
          ))
        },
        'minecraft:cured_zombie_villager': {
          villager: EntityPredicate,
          zombie: EntityPredicate
        },
        'minecraft:default_block_use': {
          location: EntityPredicate
        },
        'minecraft:effects_changed': {
          effects: Opt(MapNode(
            StringNode({ validator: 'resource', params: { pool: 'mob_effect' } }),
            Reference('status_effect_predicate')
          )),
          source: Opt(EntityPredicate)
        },
        'minecraft:enter_block': {
          block: Opt(StringNode({ validator: 'resource', params: { pool: 'block' } })),
          state: Opt(MapNode(
            StringNode(),
            StringNode(),
            { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'block' }] } } }
          ))
        },
        'minecraft:enchanted_item': {
          levels: Opt(Reference('int_bounds')),
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:entity_hurt_player': {
          damage: Opt(Reference('damage_predicate'))
        },
        'minecraft:entity_killed_player': {
          entity: EntityPredicate,
          killing_blow: Opt(Reference('damage_source_predicate'))
        },
        'minecraft:fall_after_explosion': {
          start_position: Opt(Reference('location_predicate')),
          distance: Opt(Reference('distance_predicate')),
          cause: EntityPredicate,
        },
        'minecraft:fall_from_height': {
          start_position: Opt(Reference('location_predicate')),
          distance: Opt(Reference('distance_predicate'))
        },
        'minecraft:filled_bucket': {
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:fishing_rod_hooked': {
          rod: Opt(Reference('item_predicate')),
          entity: EntityPredicate,
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:inventory_changed': {
          slots: Opt(ObjectNode({
            empty: Opt(Reference('int_bounds')),
            occupied: Opt(Reference('int_bounds')),
            full: Opt(Reference('int_bounds'))
          })),
          items: Opt(ListNode(
            Reference('item_predicate')
          ))
        },
        'minecraft:item_durability_changed': {
          delta: Opt(Reference('int_bounds')),
          durability: Opt(Reference('int_bounds')),
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:item_used_on_block': {
          location: EntityPredicate
        },
        'minecraft:kill_mob_near_sculk_catalyst': {
          entity: EntityPredicate,
          killing_blow: Opt(Reference('damage_source_predicate'))
        },
        'minecraft:killed_by_arrow': {
          unique_entity_types: Opt(Reference('int_bounds')),
          fired_from_weapon: Opt(Reference('item_predicate')),
          victims: Opt(ListNode(
            EntityPredicate
          ))
        },
        'minecraft:levitation': {
          distance: Opt(Reference('distance_predicate')),
          duration: Opt(Reference('int_bounds'))
        },
        'minecraft:lightning_strike': {
          lightning: EntityPredicate,
          bystander: EntityPredicate,
        },
        'minecraft:nether_travel': {
          start_position: Opt(Reference('location_predicate')),
          distance: Opt(Reference('distance_predicate')),
        },
        'minecraft:placed_block': {
          location: EntityPredicate
        },
        'minecraft:player_generates_container_loot': {
          loot_table: StringNode({ validator: 'resource', params: { pool: '$loot_table' } })
        },
        'minecraft:player_hurt_entity': {
          damage: Opt(Reference('damage_predicate')),
          entity: EntityPredicate
        },
        'minecraft:player_interacted_with_entity': {
          item: Opt(Reference('item_predicate')),
          entity: EntityPredicate
        },
        'minecraft:player_killed_entity': {
          entity: EntityPredicate,
          killing_blow: Opt(Reference('damage_source_predicate'))
        },
        'minecraft:recipe_crafted': {
          recipe_id: StringNode({ validator: 'resource', params: { pool: '$recipe' } }),
          ingredients: Opt(ListNode(
            Reference('item_predicate')
          ))
        },
        'minecraft:recipe_unlocked': {
          recipe: StringNode({ validator: 'resource', params: { pool: '$recipe' } })
        },
        'minecraft:ride_entity_in_lava': {
          start_position: Opt(Reference('location_predicate')),
          distance: Opt(Reference('distance_predicate'))
        },
        'minecraft:slide_down_block': {
          block: Opt(StringNode({ validator: 'resource', params: { pool: 'block' } }))
        },
        'minecraft:shot_crossbow': {
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:summoned_entity': {
          entity: EntityPredicate
        },
        'minecraft:tame_animal': {
          entity: EntityPredicate
        },
        'minecraft:target_hit': {
          projectile: EntityPredicate,
          shooter: EntityPredicate,
          signal_strength: Opt(Reference('int_bounds'))
        },
        'minecraft:thrown_item_picked_up_by_entity': {
          entity: EntityPredicate,
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:thrown_item_picked_up_by_player': {
          entity: EntityPredicate,
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:used_ender_eye': {
          distance: Opt(Reference('float_bounds'))
        },
        'minecraft:used_totem': {
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:using_item': {
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:villager_trade': {
          villager: EntityPredicate,
          item: Opt(Reference('item_predicate'))
        },
      }
    }, { context: 'criterion' }))
  }, { category: 'predicate', context: 'criterion' }))
}
