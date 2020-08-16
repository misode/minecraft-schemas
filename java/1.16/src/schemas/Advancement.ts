import {
  BooleanNode,
  Case,
  ChoiceNode,
  EnumNode as RawEnumNode,
  INode,
  ListNode,
  MapNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Resource,
  StringNode,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Opt
} from '@mcschema/core'
import { Range } from './Common'

export function initAdvancementSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const EnumNode = RawEnumNode.bind(undefined, collections)

  const PredicateChoice = (node: INode<any>): INode<any> => {
    return ChoiceNode([
      {
        type: 'object',
        node,
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
    ], { choiceContext: 'conditions' })
  }

  schemas.register('advancement', Mod(ObjectNode({
    display: Opt(ObjectNode({
      icon: ObjectNode({
        item: Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } })),
        nbt: Opt(StringNode({ validation: { validator: 'nbt', params: { registry: { category: 'minecraft:item', id: ['pop', { push: 'item' }] } } } }))
      }),
      title: Reference('text_component'),
      description: Reference('text_component'),
      background: Opt(StringNode()),
      frame: Opt(EnumNode(['task', 'challenge', 'goal'])),
      show_toast: Opt(BooleanNode()),
      announce_to_chat: Opt(BooleanNode()),
      hidden: Opt(BooleanNode())
    })),
    parent: Opt(StringNode({ validation: { validator: 'resource', params: { pool: '$advancement' } } })),
    criteria: MapNode(
      StringNode(),
      Reference('advancement_criteria')
    ),
    requirements: ListNode(
      ListNode(
        StringNode()
      )
    ),
    rewards: ObjectNode({
      function: StringNode({ validation: { validator: 'resource', params: { pool: '$function' } } }),
      loot: ListNode(
        StringNode({ validation: { validator: 'resource', params: { pool: '$loot_table' } } })
      ),
      recipes: ListNode(
        StringNode({ validation: { validator: 'resource', params: { pool: '$recipe' } } })
      ),
      experience: NumberNode({ integer: true })
    }),
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
    trigger: Resource(EnumNode('advancement_trigger', { validation: { validator: 'resource', params: { pool: collections.get('advancement_trigger') } } })),
    conditions: ObjectNode({
      player: Opt(Mod(PredicateChoice(
        Reference('entity_predicate')
      ), {
        enabled: path => path.pop().push('trigger').get() !== 'minecraft:impossible'
      })),
      [Switch]: path => path.pop().push('trigger'),
      [Case]: {
        'minecraft:bee_nest_destroyed': {
          block: Resource(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } })),
          num_bees_inside: NumberNode({ integer: true }),
          item: Reference('item_predicate')
        },
        'minecraft:bred_animals': {
          parent: PredicateChoice(Reference('entity_predicate')),
          partner: PredicateChoice(Reference('entity_predicate')),
          child: PredicateChoice(Reference('entity_predicate'))
        },
        'minecraft:brewed_potion': {
          potion: StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:potion' } } })
        },
        'minecraft:changed_dimension': {
          from: Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$dimension' } } })),
          to: Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$dimension' } } }))
        },
        'minecraft:channeled_lightning': {
          victims: ListNode(
            PredicateChoice(Reference('entity_predicate'))
          )
        },
        'minecraft:construct_beacon': {
          level: Range()
        },
        'minecraft:consume_item': {
          item: Reference('item_predicate')
        },
        'minecraft:cured_zombie_villager': {
          villager: PredicateChoice(Reference('entity_predicate')),
          zombie: PredicateChoice(Reference('entity_predicate'))
        },
        'minecraft:effects_changed': {
          effects: MapNode(
            Resource(EnumNode('mob_effect', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:mob_effect' } } })),
            ObjectNode({
              amplifier: Range(),
              duration: Range()
            })
          )
        },
        'minecraft:enter_block': {
          block: Resource(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } })),
          state: MapNode(
            StringNode(),
            StringNode(),
            { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'block' }] } } }
          )
        },
        'minecraft:enchanted_item': {
          levels: Range(),
          item: Reference('item_predicate')
        },
        'minecraft:entity_hurt_player': {
          damage: Reference('damage_predicate')
        },
        'minecraft:entity_killed_player': {
          entity: PredicateChoice(Reference('entity_predicate')),
          killing_blow: Reference('damage_source_predicate')
        },
        'minecraft:filled_bucket': {
          item: Reference('item_predicate')
        },
        'minecraft:fishing_rod_hooked': {
          entity: PredicateChoice(Reference('entity_predicate')),
          item: Reference('item_predicate')
        },
        'minecraft:hero_of_the_village': {
          location: Reference('location_predicate')
        },
        'minecraft:inventory_changed': {
          slots: ObjectNode({
            empty: Range(),
            occupied: Range(),
            full: Range()
          }),
          items: ListNode(
            Reference('item_predicate')
          )
        },
        'minecraft:item_durability_changed': {
          delta: Range(),
          durability: Range(),
          item: Reference('item_predicate')
        },
        'minecraft:item_used_on_block': {
          item: Reference('item_predicate'),
          location: Reference('location_predicate')
        },
        'minecraft:killed_by_crossbow': {
          unique_entity_types: Range(),
          victims: ListNode(
            PredicateChoice(Reference('entity_predicate'))
          )
        },
        'minecraft:levitation': {
          distance: Range(),
          duration: Range()
        },
        'minecraft:location': {
          location: Reference('location_predicate')
        },
        'minecraft:nether_travel': {
          distance: Range(),
          entered: Reference('location_predicate'),
          exited: Reference('location_predicate')
        },
        'minecraft:placed_block': {
          block: Resource(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } })),
          state: MapNode(
            StringNode(),
            StringNode(),
            { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'block' }] } } }
          ),
          item: Reference('item_predicate'),
          location: Reference('location_predicate')
        },
        'minecraft:player_generates_container_loot': {
          loot_table: StringNode({ validation: { validator: 'resource', params: { pool: '$loot_table' } } })
        },
        'minecraft:player_hurt_entity': {
          damage: Reference('damage_predicate'),
          entity: PredicateChoice(Reference('entity_predicate'))
        },
        'minecraft:player_killed_entity': {
          entity: PredicateChoice(Reference('entity_predicate')),
          killing_blow: Reference('damage_source_predicate')
        },
        'minecraft:recipe_unlocked': {
          recipe: StringNode({ validation: { validator: 'resource', params: { pool: '$recipe' } } })
        },
        'minecraft:slept_in_bed': {
          location: Reference('location_predicate')
        },
        'minecraft:slide_down_block': {
          block: Resource(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } }))
        },
        'minecraft:shot_crossbow': {
          item: Reference('item_predicate')
        },
        'minecraft:summoned_entity': {
          entity: PredicateChoice(Reference('entity_predicate'))
        },
        'minecraft:tame_animal': {
          entity: PredicateChoice(Reference('entity_predicate'))
        },
        'minecraft:target_hit': {
          projectile: PredicateChoice(Reference('entity_predicate')),
          shooter: PredicateChoice(Reference('entity_predicate')),
          signal_strength: Range({ integer: true })
        },
        'minecraft:thrown_item_picked_up_by_entity': {
          entity: Reference('entity_predicate'),
          item: Reference('item_predicate')
        },
        'minecraft:used_ender_eye': {
          distance: Range()
        },
        'minecraft:used_totem': {
          item: Reference('item_predicate')
        },
        'minecraft:villager_trade': {
          villager: Reference('entity_predicate'),
          item: Reference('item_predicate')
        },
        'minecraft:voluntary_exile': {
          location: Reference('location_predicate')
        }
      }
    }, { context: 'criterion' })
  }, { category: 'predicate', context: 'criterion' }))
}
