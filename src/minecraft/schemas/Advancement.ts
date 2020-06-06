import { EnumNode } from '../../nodes/EnumNode';
import { ResourceNode } from '../nodes/ResourceNode';
import { NumberNode } from '../../nodes/NumberNode';
import { BooleanNode } from '../../nodes/BooleanNode';
import { ObjectNode, Switch, Case } from '../../nodes/ObjectNode';
import { ListNode } from '../../nodes/ListNode';
import { RangeNode } from '../nodes/RangeNode';
import { MapNode } from '../../nodes/MapNode';
import { StringNode } from '../../nodes/StringNode';
import { ReferenceNode } from '../../nodes/ReferenceNode';
import { JsonNode } from '../nodes/JsonNode';
import { SCHEMAS, COLLECTIONS } from '../../Registries';

import './Predicates'

SCHEMAS.register('advancement', new ObjectNode({
  display: new ObjectNode({
    icon: new ObjectNode({
      item: new ResourceNode(COLLECTIONS.get('items')),
      nbt: new StringNode()
    }),
    title: new JsonNode(),
    description: new JsonNode(),
    background: new StringNode(),
    frame: new EnumNode(['task', 'challenge', 'goal']),
    show_toast: new BooleanNode(),
    announce_to_chat: new BooleanNode(),
    hidden: new BooleanNode()
  }, {collapse: true}),
  parent: new StringNode(),
  criteria: new MapNode(
    new StringNode(),
    new ReferenceNode('advancement-criteria')
  ),
  rewards: new ObjectNode({
    function: new StringNode(),
    loot: new StringNode(),
    recipes: new ListNode(
      new StringNode()
    ),
    experience: new NumberNode({integer: true})
  }, {collapse: true}),
}, {
  default: () => ({
    criteria: {
      requirement: {
        trigger: 'location'
      }
    }
  })
}))

SCHEMAS.register('advancement-criteria', new ObjectNode({
  trigger: new ResourceNode(COLLECTIONS.get('advancement-triggers')),
  conditions: new ObjectNode({
    player: new ReferenceNode('entity-predicate', {
      collapse: true,
      enable: path => path.push('trigger').get() !== 'impossible'
    }),
    [Switch]: path => path.pop().push('trigger').get(),
    [Case]: {
      'bee_nest_destroyed': {
        block: new ResourceNode(COLLECTIONS.get('blocks')),
        num_bees_inside: new NumberNode({integer: true}),
        item: new ReferenceNode('item-predicate', {collapse: true})
      },
      'bred_animals': {
        parent: new ReferenceNode('entity-predicate', {collapse: true}),
        partner: new ReferenceNode('entity-predicate', {collapse: true}),
        child: new ReferenceNode('entity-predicate', {collapse: true})
      },
      'brewed_potion': {
        potion: new StringNode()
      },
      'changed_dimension': {
        from: new ResourceNode(COLLECTIONS.get('dimensions')),
        to: new ResourceNode(COLLECTIONS.get('dimensions'))
      },
      'channeled_lightning': {
        victims: new ListNode(
          new ReferenceNode('entity-predicate')
        )
      },
      'construct_beacon': {
        level: new RangeNode()
      },
      'consume_item': {
        item: new ReferenceNode('item-predicate', {collapse: true})
      },
      'cured_zombie_villager': {
        villager: new ReferenceNode('entity-predicate', {collapse: true}),
        zombie: new ReferenceNode('entity-predicate', {collapse: true})
      },
      'effects_changed': {
        effects: new MapNode(
          new EnumNode(COLLECTIONS.get('status-effects')),
          new ObjectNode({
            amplifier: new RangeNode(),
            duration: new RangeNode()
          })
        )
      },
      'enter_block': {
        block: new ResourceNode(COLLECTIONS.get('blocks')),
        state: new MapNode(
          new StringNode(),
          new StringNode()
        )
      },
      'enchanted_item': {
        levels: new RangeNode(),
        item: new ReferenceNode('item-predicate', {collapse: true})
      },
      'entity_hurt_player': {
        entity: new ReferenceNode('entity-predicate', {collapse: true}),
        damage: new ReferenceNode('damage-predicate', {collapse: true})
      },
      'entity_killed_player': {
        entity: new ReferenceNode('entity-predicate', {collapse: true}),
        killing_blow: new ReferenceNode('damage-source-predicate', {collapse: true})
      },
      'filled_bucket': {
        item: new ReferenceNode('item-predicate', {collapse: true})
      },
      'fishing_rod_hooked': {
        entity: new ReferenceNode('entity-predicate', {collapse: true}),
        item: new ReferenceNode('item-predicate', {collapse: true})
      },
      'hero_of_the_village': {
        location: new ReferenceNode('location-predicate', {collapse: true})
      },
      'inventory_changed': {
        slots: new ObjectNode({
          empty: new RangeNode(),
          occupied: new RangeNode(),
          fill: new RangeNode()
        }),
        items: new ListNode(
          new ReferenceNode('item-predicate')
        )
      },
      'item_durability_changed': {
        delta: new RangeNode(),
        durability: new RangeNode(),
        item: new ReferenceNode('item-predicate', {collapse: true})
      },
      'item_used_on_block': {
        item: new ReferenceNode('item-predicate', {collapse: true}),
        location: new ReferenceNode('location-predicate', {collapse: true})
      },
      'killed_by_crossbow': {
        unique_entity_types: new RangeNode(),
        victims: new ListNode(
          new ReferenceNode('entity-predicate')
        )
      },
      'levitation': {
        distance: new RangeNode(),
        duration: new RangeNode()
      },
      'location': {
        location: new ReferenceNode('location-predicate', {collapse: true})
      },
      'nether_travel': {
        distance: new RangeNode()
      },
      'placed_block': {
        block: new ResourceNode(COLLECTIONS.get('blocks')),
        state: new MapNode(
          new StringNode(),
          new StringNode()
        ),
        item: new ReferenceNode('item-predicate', {collapse: true}),
        location: new ReferenceNode('location-predicate', {collapse: true})
      },
      'player_generates_container_loot': {
        loot_table: new StringNode()
      },
      'player_hurt_entity': {
        damage: new ReferenceNode('damage-predicate', {collapse: true}),
        entity: new ReferenceNode('entity-predicate', {collapse: true})
      },
      'player_killed_player': {
        killing_blow: new ReferenceNode('damage-source-predicate', {collapse: true})
      },
      'recipe_unlocked': {
        recipe: new StringNode()
      },
      'slept_in_bed': {
        location: new ReferenceNode('location-predicate', {collapse: true})
      },
      'slide_down_block': {
        block: new ResourceNode(COLLECTIONS.get('blocks'))
      },
      'shot_crossbow': {
        item: new ReferenceNode('item-predicate', {collapse: true})
      },
      'summoned_entity': {
        entity: new ReferenceNode('entity-predicate', {collapse: true})
      },
      'tame_animal': {
        entity: new ReferenceNode('entity-predicate', {collapse: true})
      },
      'thrown_item_picked_up_by_entity': {
        entity: new ReferenceNode('entity-predicate', {collapse: true}),
        item: new ReferenceNode('item-predicate', {collapse: true})
      },
      'used_ender_eye': {
        distance: new RangeNode()
      },
      'used_totem': {
        item: new ReferenceNode('item-predicate', {collapse: true})
      },
      'villager_trade': {
        item: new ReferenceNode('item-predicate', {collapse: true})
      },
      'voluntary_exile': {
        location: new ReferenceNode('location-predicate', {collapse: true})
      }
    }
  })
}, {
  category: 'predicate'
}))

export const AdvancementSchema = SCHEMAS.get('advancement')
