import {
  BooleanNode,
  Case,
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
import { Range } from './Common'
import { LocationFields } from './Predicates'

export function initAdvancementSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('advancement', Mod(ObjectNode({
    display: Opt(Mod(ObjectNode({
      icon: ObjectNode({
        item: StringNode({ validator: 'resource', params: { pool: 'item' } }),
        nbt: Opt(StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:item', id: ['pop', { push: 'item' }] } } }))
      }),
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
          item: 'minecraft:stone'
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
    trigger: StringNode({ validator: 'resource', params: { pool: collections.get('advancement_trigger') } }),
    conditions: Opt(ObjectNode({
      [Switch]: ['pop', { push: 'trigger' }],
      [Case]: {
        'minecraft:bee_nest_destroyed': {
          block: Opt(StringNode({ validator: 'resource', params: { pool: 'block' } })),
          num_bees_inside: Opt(NumberNode({ integer: true })),
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:bred_animals': {
          parent: Opt(Reference('entity_predicate')),
          partner: Opt(Reference('entity_predicate')),
          child: Opt(Reference('entity_predicate'))
        },
        'minecraft:brewed_potion': {
          potion: Opt(StringNode({ validator: 'resource', params: { pool: 'potion' } }))
        },
        'minecraft:changed_dimension': {
          from: Opt(StringNode({ enum: 'dimension' })),
          to: Opt(StringNode({ enum: 'dimension' }))
        },
        'minecraft:channeled_lightning': {
          victims: Opt(ListNode(
            Opt(Reference('entity_predicate'))
          ))
        },
        'minecraft:construct_beacon': {
          level: Opt(Range())
        },
        'minecraft:consume_item': {
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:cured_zombie_villager': {
          villager: Opt(Reference('entity_predicate')),
          zombie: Opt(Reference('entity_predicate'))
        },
        'minecraft:effects_changed': {
          effects: Opt(MapNode(
            StringNode({ validator: 'resource', params: { pool: 'mob_effect' } }),
            Reference('status_effect_predicate')
          ))
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
          levels: Opt(Range()),
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:entity_hurt_player': {
          damage: Opt(Reference('damage_predicate'))
        },
        'minecraft:entity_killed_player': {
          entity: Opt(Reference('entity_predicate')),
          killing_blow: Opt(Reference('damage_source_predicate'))
        },
        'minecraft:filled_bucket': {
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:fishing_rod_hooked': {
          entity: Opt(Reference('entity_predicate')),
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:hero_of_the_village': LocationFields,
        'minecraft:inventory_changed': {
          slots: Opt(ObjectNode({
            empty: Opt(Range()),
            occupied: Opt(Range()),
            full: Opt(Range())
          })),
          items: Opt(ListNode(
            Reference('item_predicate')
          ))
        },
        'minecraft:item_durability_changed': {
          delta: Opt(Range()),
          durability: Opt(Range()),
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:killed_by_crossbow': {
          unique_entity_types: Opt(Range()),
          victims: Opt(ListNode(
            Opt(Reference('entity_predicate'))
          ))
        },
        'minecraft:levitation': {
          distance: Opt(Range()),
          duration: Opt(Range())
        },
        'minecraft:location': LocationFields,
        'minecraft:nether_travel': {
          distance: Opt(Range()),
          entered: Opt(Reference('location_predicate')),
          exited: Opt(Reference('location_predicate'))
        },
        'minecraft:placed_block': {
          block: Opt(StringNode({ validator: 'resource', params: { pool: 'block' } })),
          state: Opt(MapNode(
            StringNode(),
            StringNode(),
            { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'block' }] } } }
          )),
          item: Opt(Reference('item_predicate')),
          location: Opt(Reference('location_predicate'))
        },
        'minecraft:player_hurt_entity': {
          damage: Opt(Reference('damage_predicate')),
          entity: Opt(Reference('entity_predicate'))
        },
        'minecraft:player_killed_entity': {
          entity: Opt(Reference('entity_predicate')),
          killing_blow: Opt(Reference('damage_source_predicate'))
        },
        'minecraft:recipe_unlocked': {
          recipe: StringNode({ validator: 'resource', params: { pool: '$recipe' } })
        },
        'minecraft:safely_harvest_honey': {
          block: Opt(ObjectNode({
            block: Opt(StringNode({ validator: 'resource', params: { pool: 'block' } })),
            tag: Opt(StringNode({ validator: 'resource', params: { pool: '$tag/block' } }))
          })),
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:slept_in_bed': LocationFields,
        'minecraft:slide_down_block': {
          block: Opt(StringNode({ validator: 'resource', params: { pool: 'block' } }))
        },
        'minecraft:shot_crossbow': {
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:summoned_entity': {
          entity: Opt(Reference('entity_predicate'))
        },
        'minecraft:tame_animal': {
          entity: Opt(Reference('entity_predicate'))
        },
        'minecraft:used_ender_eye': {
          distance: Opt(Range())
        },
        'minecraft:used_totem': {
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:villager_trade': {
          villager: Opt(Reference('entity_predicate')),
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:voluntary_exile': LocationFields
      }
    }, { context: 'criterion' }))
  }, { category: 'predicate', context: 'criterion' }))
}
