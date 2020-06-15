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
      item: Resource(EnumNode('item')),
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
  trigger: Resource(EnumNode('advancement_trigger')),
  conditions: ObjectNode({
    player: Mod(Reference('entity-predicate', { collapse: true }), {
      enabled: (path: Path) => path.push('trigger').get() !== 'impossible'
    }),
    [Switch]: path => path.pop().push('trigger').get(),
    [Case]: {
      'minecraft:bee_nest_destroyed': {
        block: Resource(EnumNode('block')),
        num_bees_inside: NumberNode({integer: true}),
        item: Reference('item-predicate', {collapse: true})
      },
      'minecraft:bred_animals': {
        parent: Reference('entity-predicate', {collapse: true}),
        partner: Reference('entity-predicate', {collapse: true}),
        child: Reference('entity-predicate', {collapse: true})
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
          Reference('entity-predicate')
        )
      },
      'minecraft:construct_beacon': {
        level: RangeNode()
      },
      'minecraft:consume_item': {
        item: Reference('item-predicate', {collapse: true})
      },
      'minecraft:cured_zombie_villager': {
        villager: Reference('entity-predicate', {collapse: true}),
        zombie: Reference('entity-predicate', {collapse: true})
      },
      'minecraft:effects_changed': {
        effects: MapNode(
          EnumNode('mob_effect'),
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
        item: Reference('item-predicate', {collapse: true})
      },
      'minecraft:entity_hurt_player': {
        entity: Reference('entity-predicate', {collapse: true}),
        damage: Reference('damage-predicate', {collapse: true})
      },
      'minecraft:entity_killed_player': {
        entity: Reference('entity-predicate', {collapse: true}),
        killing_blow: Reference('damage-source-predicate', {collapse: true})
      },
      'minecraft:filled_bucket': {
        item: Reference('item-predicate', {collapse: true})
      },
      'minecraft:fishing_rod_hooked': {
        entity: Reference('entity-predicate', {collapse: true}),
        item: Reference('item-predicate', {collapse: true})
      },
      'minecraft:hero_of_the_village': {
        location: Reference('location-predicate', {collapse: true})
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
        item: Reference('item-predicate', {collapse: true})
      },
      'minecraft:item_used_on_block': {
        item: Reference('item-predicate', {collapse: true}),
        location: Reference('location-predicate', {collapse: true})
      },
      'minecraft:killed_by_crossbow': {
        unique_entity_types: RangeNode(),
        victims: ListNode(
          Reference('entity-predicate')
        )
      },
      'minecraft:levitation': {
        distance: RangeNode(),
        duration: RangeNode()
      },
      'minecraft:location': {
        location: Reference('location-predicate', {collapse: true})
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
        item: Reference('item-predicate', {collapse: true}),
        location: Reference('location-predicate', {collapse: true})
      },
      'minecraft:player_generates_container_loot': {
        loot_table: StringNode()
      },
      'minecraft:player_hurt_entity': {
        damage: Reference('damage-predicate', {collapse: true}),
        entity: Reference('entity-predicate', {collapse: true})
      },
      'minecraft:player_killed_player': {
        killing_blow: Reference('damage-source-predicate', {collapse: true})
      },
      'minecraft:recipe_unlocked': {
        recipe: StringNode()
      },
      'minecraft:slept_in_bed': {
        location: Reference('location-predicate', {collapse: true})
      },
      'minecraft:slide_down_block': {
        block: Resource(EnumNode('blocks'))
      },
      'minecraft:shot_crossbow': {
        item: Reference('item-predicate', {collapse: true})
      },
      'minecraft:summoned_entity': {
        entity: Reference('entity-predicate', {collapse: true})
      },
      'minecraft:tame_animal': {
        entity: Reference('entity-predicate', {collapse: true})
      },
      'minecraft:thrown_item_picked_up_by_entity': {
        entity: Reference('entity-predicate', {collapse: true}),
        item: Reference('item-predicate', {collapse: true})
      },
      'minecraft:used_ender_eye': {
        distance: RangeNode()
      },
      'minecraft:used_totem': {
        item: Reference('item-predicate', {collapse: true})
      },
      'minecraft:villager_trade': {
        item: Reference('item-predicate', {collapse: true})
      },
      'minecraft:voluntary_exile': {
        location: Reference('location-predicate', {collapse: true})
      }
    }
  })
}, {
  category: 'predicate'
}))

export const AdvancementSchema = SCHEMAS.get('advancement')
