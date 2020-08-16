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
    requirements: Opt(ListNode(
      ListNode(
        StringNode() // TODO: add validation
      )
    )),
    rewards: Opt(ObjectNode({
      function: Opt(Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$function' } } }))),
      loot: Opt(ListNode(
        Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$loot_table' } } }))
      )),
      recipes: Opt(ListNode(
        Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$recipe' } } }))
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
          block: Opt(Resource(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } }))),
          num_bees_inside: Opt(NumberNode({ integer: true })),
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:bred_animals': {
          parent: Opt(PredicateChoice(Reference('entity_predicate'))),
          partner: Opt(PredicateChoice(Reference('entity_predicate'))),
          child: Opt(PredicateChoice(Reference('entity_predicate')))
        },
        'minecraft:brewed_potion': {
          potion: Opt(StringNode({ validation: { validator: 'resource', params: { pool: 'minecraft:potion' } } }))
        },
        'minecraft:changed_dimension': {
          from: Opt(Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$dimension' } } }))),
          to: Opt(Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$dimension' } } })))
        },
        'minecraft:channeled_lightning': {
          victims: Opt(ListNode(
            PredicateChoice(Reference('entity_predicate'))
          ))
        },
        'minecraft:construct_beacon': {
          level: Opt(Range())
        },
        'minecraft:consume_item': {
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:cured_zombie_villager': {
          villager: Opt(PredicateChoice(Reference('entity_predicate'))),
          zombie: Opt(PredicateChoice(Reference('entity_predicate')))
        },
        'minecraft:effects_changed': {
          effects: Opt(MapNode(
            Resource(EnumNode('mob_effect', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:mob_effect' } } })),
            ObjectNode({
              amplifier: Range(),
              duration: Range()
            })
          ))
        },
        'minecraft:enter_block': {
          block: Opt(Resource(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } }))),
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
          entity: Opt(PredicateChoice(Reference('entity_predicate'))),
          killing_blow: Opt(Reference('damage_source_predicate'))
        },
        'minecraft:filled_bucket': {
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:fishing_rod_hooked': {
          entity: Opt(PredicateChoice(Reference('entity_predicate'))),
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:hero_of_the_village': {
          location: Opt(Reference('location_predicate'))
        },
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
        'minecraft:item_used_on_block': {
          item: Opt(Reference('item_predicate')),
          location: Opt(Reference('location_predicate'))
        },
        'minecraft:killed_by_crossbow': {
          unique_entity_types: Opt(Range()),
          victims: Opt(ListNode(
            PredicateChoice(Reference('entity_predicate'))
          ))
        },
        'minecraft:levitation': {
          distance: Opt(Range()),
          duration: Opt(Range())
        },
        'minecraft:location': {
          location: Opt(Reference('location_predicate'))
        },
        'minecraft:nether_travel': {
          distance: Opt(Range()),
          entered: Opt(Reference('location_predicate')),
          exited: Opt(Reference('location_predicate'))
        },
        'minecraft:placed_block': {
          block: Opt(Resource(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } }))),
          state: Opt(MapNode(
            StringNode(),
            StringNode(),
            { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'block' }] } } }
          )),
          item: Opt(Reference('item_predicate')),
          location: Opt(Reference('location_predicate'))
        },
        'minecraft:player_generates_container_loot': {
          loot_table: Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$loot_table' } } }))
        },
        'minecraft:player_hurt_entity': {
          damage: Opt(Reference('damage_predicate')),
          entity: Opt(PredicateChoice(Reference('entity_predicate')))
        },
        'minecraft:player_killed_entity': {
          entity: Opt(PredicateChoice(Reference('entity_predicate'))),
          killing_blow: Opt(Reference('damage_source_predicate'))
        },
        'minecraft:recipe_unlocked': {
          recipe: Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$recipe' } } }))
        },
        'minecraft:slept_in_bed': {
          location: Opt(Reference('location_predicate'))
        },
        'minecraft:slide_down_block': {
          block: Opt(Resource(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } })))
        },
        'minecraft:shot_crossbow': {
          item: Opt(Reference('item_predicate'))
        },
        'minecraft:summoned_entity': {
          entity: Opt(PredicateChoice(Reference('entity_predicate')))
        },
        'minecraft:tame_animal': {
          entity: Opt(PredicateChoice(Reference('entity_predicate')))
        },
        'minecraft:target_hit': {
          projectile: Opt(PredicateChoice(Reference('entity_predicate'))),
          shooter: Opt(PredicateChoice(Reference('entity_predicate'))),
          signal_strength: Opt(Range({ integer: true }))
        },
        'minecraft:thrown_item_picked_up_by_entity': {
          entity: Opt(Reference('entity_predicate')),
          item: Opt(Reference('item_predicate'))
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
        'minecraft:voluntary_exile': {
          location: Reference('location_predicate')
        }
      }
    }, { context: 'criterion' })
  }, { category: 'predicate', context: 'criterion' }))
}
