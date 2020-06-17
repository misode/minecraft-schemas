import { Path } from '../../model/Path';
import { Mod, Force, INode } from '../../nodes/Node';
import { EnumNode } from '../../nodes/EnumNode';
import { Resource } from '../nodes/Resource';
import { NumberNode } from '../../nodes/NumberNode';
import { BooleanNode } from '../../nodes/BooleanNode';
import { ObjectNode, Switch, Case } from '../../nodes/ObjectNode';
import { ListNode } from '../../nodes/ListNode';
import { RangeNode } from '../nodes/RangeNode';
import { MapNode } from '../../nodes/MapNode';
import { StringNode } from '../../nodes/StringNode';
import { Reference } from '../../nodes/Reference';
import { JsonNode } from '../nodes/JsonNode';
import { ChoiceNode } from '../../nodes/ChoiceNode';
import { SCHEMAS } from '../../Registries';

import './Predicates'

export const PredicateChoice = (node: INode<any>): INode<any> => {
  return ChoiceNode([
    [
      'object',
      node,
      v => v[0]?.predicate ?? ({})
    ],
    [
      'list',
      ListNode(Reference('condition')),
      v => [{
        condition: 'minecraft:entity_properties',
        predicate: v
      }]
    ]
  ])
}

SCHEMAS.register('advancement', Mod(ObjectNode({
  display: ObjectNode({
    icon: Force(ObjectNode({
      item: Force(Resource(EnumNode('item'))),
      nbt: StringNode()
    })),
    title: Force(JsonNode()),
    description: Force(JsonNode()),
    background: StringNode(),
    frame: EnumNode(['task', 'challenge', 'goal']),
    show_toast: BooleanNode(),
    announce_to_chat: BooleanNode(),
    hidden: BooleanNode()
  }, { collapse: true }),
  parent: StringNode(),
  criteria: MapNode(
    StringNode(),
    Reference('advancement-criteria')
  ),
  requirements: ListNode(
    ListNode(
      StringNode()
    )
  ),
  rewards: ObjectNode({
    function: StringNode(),
    loot: StringNode(),
    recipes: ListNode(
      StringNode()
    ),
    experience: NumberNode({ integer: true })
  }, { collapse: true }),
}), {
  default: () => ({
    criteria: {
      requirement: {
        trigger: 'location'
      }
    }
  })
}))

SCHEMAS.register('advancement-criteria', ObjectNode({
  trigger: Force(Resource(EnumNode('advancement_trigger'))),
  conditions: ObjectNode({
    player: Mod(PredicateChoice(
      Reference('entity-predicate', { collapse: true })
    ), {
      enabled: (path: Path) => path.pop().push('trigger').get() !== 'minecraft:impossible'
    }),
    [Switch]: path => path.pop().push('trigger'),
    [Case]: {
      'minecraft:bee_nest_destroyed': {
        block: Resource(EnumNode('block')),
        num_bees_inside: NumberNode({ integer: true }),
        item: Reference('item-predicate', { collapse: true })
      },
      'minecraft:bred_animals': {
        parent: PredicateChoice(Reference('entity-predicate', { collapse: true })),
        partner: PredicateChoice(Reference('entity-predicate', { collapse: true })),
        child: PredicateChoice(Reference('entity-predicate', { collapse: true }))
      },
      'minecraft:brewed_potion': {
        potion: StringNode()
      },
      'minecraft:changed_dimension': {
        from: Resource(StringNode()),
        to: Resource(StringNode())
      },
      'minecraft:channeled_lightning': {
        victims: ListNode(
          PredicateChoice(Reference('entity-predicate'))
        )
      },
      'minecraft:construct_beacon': {
        level: RangeNode()
      },
      'minecraft:consume_item': {
        item: Reference('item-predicate', { collapse: true })
      },
      'minecraft:cured_zombie_villager': {
        villager: PredicateChoice(Reference('entity-predicate', { collapse: true })),
        zombie: PredicateChoice(Reference('entity-predicate', { collapse: true }))
      },
      'minecraft:effects_changed': {
        effects: MapNode(
          EnumNode('mob_effect', { search: true }),
          ObjectNode({
            amplifier: RangeNode(),
            duration: RangeNode()
          })
        )
      },
      'minecraft:enter_block': {
        block: Resource(EnumNode('block')),
        state: MapNode(
          StringNode(),
          StringNode()
        )
      },
      'minecraft:enchanted_item': {
        levels: RangeNode(),
        item: Reference('item-predicate', { collapse: true })
      },
      'minecraft:entity_hurt_player': {
        damage: Reference('damage-predicate', { collapse: true })
      },
      'minecraft:entity_killed_player': {
        entity: PredicateChoice(Reference('entity-predicate', { collapse: true })),
        killing_blow: Reference('damage-source-predicate', { collapse: true })
      },
      'minecraft:filled_bucket': {
        item: Reference('item-predicate', { collapse: true })
      },
      'minecraft:fishing_rod_hooked': {
        entity: PredicateChoice(Reference('entity-predicate', { collapse: true })),
        item: Reference('item-predicate', { collapse: true })
      },
      'minecraft:hero_of_the_village': {
        location: Reference('location-predicate', { collapse: true })
      },
      'minecraft:inventory_changed': {
        slots: ObjectNode({
          empty: RangeNode(),
          occupied: RangeNode(),
          fill: RangeNode()
        }),
        items: ListNode(
          Reference('item-predicate')
        )
      },
      'minecraft:item_durability_changed': {
        delta: RangeNode(),
        durability: RangeNode(),
        item: Reference('item-predicate', { collapse: true })
      },
      'minecraft:item_used_on_block': {
        item: Reference('item-predicate', { collapse: true }),
        location: Reference('location-predicate', { collapse: true })
      },
      'minecraft:killed_by_crossbow': {
        unique_entity_types: RangeNode(),
        victims: ListNode(
          PredicateChoice(Reference('entity-predicate'))
        )
      },
      'minecraft:levitation': {
        distance: RangeNode(),
        duration: RangeNode()
      },
      'minecraft:location': {
        location: Reference('location-predicate', { collapse: true })
      },
      'minecraft:nether_travel': {
        distance: RangeNode()
      },
      'minecraft:placed_block': {
        block: Resource(EnumNode('block')),
        state: MapNode(
          StringNode(),
          StringNode()
        ),
        item: Reference('item-predicate', { collapse: true }),
        location: Reference('location-predicate', { collapse: true })
      },
      'minecraft:player_generates_container_loot': {
        loot_table: StringNode()
      },
      'minecraft:player_hurt_entity': {
        damage: Reference('damage-predicate', { collapse: true }),
        entity: PredicateChoice(Reference('entity-predicate', { collapse: true }))
      },
      'minecraft:player_killed_player': {
        entity: PredicateChoice(Reference('entity-predicate', { collapse: true })),
        killing_blow: Reference('damage-source-predicate', { collapse: true })
      },
      'minecraft:recipe_unlocked': {
        recipe: StringNode()
      },
      'minecraft:slept_in_bed': {
        location: Reference('location-predicate', { collapse: true })
      },
      'minecraft:slide_down_block': {
        block: Resource(EnumNode('block'))
      },
      'minecraft:shot_crossbow': {
        item: Reference('item-predicate', { collapse: true })
      },
      'minecraft:summoned_entity': {
        entity: PredicateChoice(Reference('entity-predicate', { collapse: true }))
      },
      'minecraft:tame_animal': {
        entity: PredicateChoice(Reference('entity-predicate', { collapse: true }))
      },
      'minecraft:target_hit': {
        signal_strength: RangeNode({ integer: true }),
        projectile: PredicateChoice(Reference('entity-predicate', { collapse: true })),
        shooter: PredicateChoice(Reference('entity-predicate', { collapse: true }))
      },
      'minecraft:thrown_item_picked_up_by_entity': {
        entity: Reference('entity-predicate', { collapse: true }),
        item: Reference('item-predicate', { collapse: true })
      },
      'minecraft:used_ender_eye': {
        distance: RangeNode()
      },
      'minecraft:used_totem': {
        item: Reference('item-predicate', { collapse: true })
      },
      'minecraft:villager_trade': {
        item: Reference('item-predicate', { collapse: true })
      },
      'minecraft:voluntary_exile': {
        location: Reference('location-predicate', { collapse: true })
      }
    }
  })
}, {
  category: 'predicate'
}))

export const AdvancementSchema = SCHEMAS.get('advancement')
