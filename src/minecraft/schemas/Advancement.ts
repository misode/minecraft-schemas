import { Path } from '../../model/Path';
import { Mod } from '../../nodes/Node';
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
import { SCHEMAS, COLLECTIONS } from '../../Registries';

import './Predicates'

SCHEMAS.register('advancement', Mod(ObjectNode({
  display: ObjectNode({
    icon: ObjectNode({
      item: Resource(EnumNode(COLLECTIONS.get('items'))),
      nbt: StringNode()
    }),
    title: JsonNode(),
    description: JsonNode(),
    background: StringNode(),
    frame: EnumNode(['task', 'challenge', 'goal']),
    show_toast: BooleanNode(),
    announce_to_chat: BooleanNode(),
    hidden: BooleanNode()
  }, {collapse: true}),
  parent: StringNode(),
  criteria: MapNode(
    StringNode(),
    Reference('advancement-criteria')
  ),
  rewards: ObjectNode({
    function: StringNode(),
    loot: StringNode(),
    recipes: ListNode(
      StringNode()
    ),
    experience: NumberNode({integer: true})
  }, {collapse: true}),
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
  trigger: Resource(EnumNode(COLLECTIONS.get('advancement-triggers'))),
  conditions: ObjectNode({
    player: Mod(Reference('entity-predicate', { collapse: true }), {
      enable: (path: Path) => path.push('trigger').get() !== 'impossible'
    }),
    [Switch]: path => path.pop().push('trigger').get(),
    [Case]: {
      'bee_nest_destroyed': {
        block: Resource(EnumNode(COLLECTIONS.get('blocks'))),
        num_bees_inside: NumberNode({integer: true}),
        item: Reference('item-predicate', {collapse: true})
      },
      'bred_animals': {
        parent: Reference('entity-predicate', {collapse: true}),
        partner: Reference('entity-predicate', {collapse: true}),
        child: Reference('entity-predicate', {collapse: true})
      },
      'brewed_potion': {
        potion: StringNode()
      },
      'changed_dimension': {
        from: Resource(StringNode()),
        to: Resource(StringNode())
      },
      'channeled_lightning': {
        victims: ListNode(
          Reference('entity-predicate')
        )
      },
      'construct_beacon': {
        level: RangeNode()
      },
      'consume_item': {
        item: Reference('item-predicate', {collapse: true})
      },
      'cured_zombie_villager': {
        villager: Reference('entity-predicate', {collapse: true}),
        zombie: Reference('entity-predicate', {collapse: true})
      },
      'effects_changed': {
        effects: MapNode(
          EnumNode(COLLECTIONS.get('status-effects')),
          ObjectNode({
            amplifier: RangeNode(),
            duration: RangeNode()
          })
        )
      },
      'enter_block': {
        block: Resource(EnumNode(COLLECTIONS.get('blocks'))),
        state: MapNode(
          StringNode(),
          StringNode()
        )
      },
      'enchanted_item': {
        levels: RangeNode(),
        item: Reference('item-predicate', {collapse: true})
      },
      'entity_hurt_player': {
        entity: Reference('entity-predicate', {collapse: true}),
        damage: Reference('damage-predicate', {collapse: true})
      },
      'entity_killed_player': {
        entity: Reference('entity-predicate', {collapse: true}),
        killing_blow: Reference('damage-source-predicate', {collapse: true})
      },
      'filled_bucket': {
        item: Reference('item-predicate', {collapse: true})
      },
      'fishing_rod_hooked': {
        entity: Reference('entity-predicate', {collapse: true}),
        item: Reference('item-predicate', {collapse: true})
      },
      'hero_of_the_village': {
        location: Reference('location-predicate', {collapse: true})
      },
      'inventory_changed': {
        slots: ObjectNode({
          empty: RangeNode(),
          occupied: RangeNode(),
          fill: RangeNode()
        }),
        items: ListNode(
          Reference('item-predicate')
        )
      },
      'item_durability_changed': {
        delta: RangeNode(),
        durability: RangeNode(),
        item: Reference('item-predicate', {collapse: true})
      },
      'item_used_on_block': {
        item: Reference('item-predicate', {collapse: true}),
        location: Reference('location-predicate', {collapse: true})
      },
      'killed_by_crossbow': {
        unique_entity_types: RangeNode(),
        victims: ListNode(
          Reference('entity-predicate')
        )
      },
      'levitation': {
        distance: RangeNode(),
        duration: RangeNode()
      },
      'location': {
        location: Reference('location-predicate', {collapse: true})
      },
      'nether_travel': {
        distance: RangeNode()
      },
      'placed_block': {
        block: Resource(EnumNode(COLLECTIONS.get('blocks'))),
        state: MapNode(
          StringNode(),
          StringNode()
        ),
        item: Reference('item-predicate', {collapse: true}),
        location: Reference('location-predicate', {collapse: true})
      },
      'player_generates_container_loot': {
        loot_table: StringNode()
      },
      'player_hurt_entity': {
        damage: Reference('damage-predicate', {collapse: true}),
        entity: Reference('entity-predicate', {collapse: true})
      },
      'player_killed_player': {
        killing_blow: Reference('damage-source-predicate', {collapse: true})
      },
      'recipe_unlocked': {
        recipe: StringNode()
      },
      'slept_in_bed': {
        location: Reference('location-predicate', {collapse: true})
      },
      'slide_down_block': {
        block: Resource(EnumNode(COLLECTIONS.get('blocks')))
      },
      'shot_crossbow': {
        item: Reference('item-predicate', {collapse: true})
      },
      'summoned_entity': {
        entity: Reference('entity-predicate', {collapse: true})
      },
      'tame_animal': {
        entity: Reference('entity-predicate', {collapse: true})
      },
      'thrown_item_picked_up_by_entity': {
        entity: Reference('entity-predicate', {collapse: true}),
        item: Reference('item-predicate', {collapse: true})
      },
      'used_ender_eye': {
        distance: RangeNode()
      },
      'used_totem': {
        item: Reference('item-predicate', {collapse: true})
      },
      'villager_trade': {
        item: Reference('item-predicate', {collapse: true})
      },
      'voluntary_exile': {
        location: Reference('location-predicate', {collapse: true})
      }
    }
  })
}, {
  category: 'predicate'
}))

export const AdvancementSchema = SCHEMAS.get('advancement')
