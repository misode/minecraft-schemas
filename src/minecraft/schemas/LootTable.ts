import { Mod } from '../../nodes/Node';
import { Path } from '../../model/Path';
import { EnumNode } from '../../nodes/EnumNode';
import { Resource } from '../nodes/Resource';
import { NumberNode } from '../../nodes/NumberNode';
import { BooleanNode } from '../../nodes/BooleanNode';
import { ObjectNode, Switch, Case } from '../../nodes/ObjectNode';
import { ListNode } from '../../nodes/ListNode';
import { RangeNode } from '../nodes/RangeNode';
import { StringNode } from '../../nodes/StringNode';
import { Reference } from '../../nodes/Reference';
import { JsonNode } from '../nodes/JsonNode';
import { SCHEMAS, COLLECTIONS } from '../../Registries';

import './Condition'

const conditions = {
  conditions: ListNode(
    Reference('condition')
  )
}

const functionsAndConditions = {
  functions: ListNode(
    Reference('loot-function')
  ),
  ...conditions
}

SCHEMAS.register('loot-table', Mod(ObjectNode({
  pools: ListNode(
    ObjectNode({
      rolls: RangeNode(),
      entries: ListNode(
        Reference('loot-entry')
      ),
      ...functionsAndConditions
    })
  ),
  ...functionsAndConditions
}), {
  default: () => ({
    pools: [
      {
        rolls: 1,
        entries: [
          {
            type: 'minecraft:item',
            name: 'minecraft:stone'
          }
        ]
      }
    ]
  })
}))

SCHEMAS.register('loot-entry', ObjectNode({
  type: Resource(EnumNode('loot_pool_entry_type')),
  weight: Mod(NumberNode({ integer: true, min: 1 }), {
    enabled: (path: Path) => path.pop().get()?.length > 1
      && !['minecraft:alternatives', 'minecraft:group', 'minecraft:sequence'].includes(path.push('type').get())
  }),
  [Switch]: path => path.push('type').get(),
  [Case]: {
    'minecraft:alternatives': {
      children: ListNode(
        Reference('loot-entry')
      ),
      ...functionsAndConditions
    },
    'minecraft:dynamic': {
      name: StringNode(),
      ...functionsAndConditions
    },
    'minecraft:group': {
      children: ListNode(
        Reference('loot-entry')
      ),
      ...functionsAndConditions
    },
    'minecraft:item': {
      name: Resource(EnumNode('item')),
      ...functionsAndConditions
    },
    'minecraft:loot_table': {
      name: StringNode(),
      ...functionsAndConditions
    },
    'minecraft:sequence': {
      children: ListNode(
        Reference('loot-entry')
      ),
      ...functionsAndConditions
    },
    'minecraft:tag': {
      name: StringNode(),
      expand: BooleanNode(),
      ...functionsAndConditions
    }
  }
}))

SCHEMAS.register('loot-function', Mod(ObjectNode({
  function: Resource(EnumNode('loot_function_type')),
  [Switch]: path => path.push('function').get(),
  [Case]: {
    'minecraft:apply_bonus': {
      enchantment: EnumNode('enchantment'),
      formula: Resource(EnumNode([
        'minecraft:uniform_bonus_count',
        'minecraft:binomial_with_bonus_count',
        'minecraft:ore_drops'
      ])),
      parameters: Mod(ObjectNode({
        bonusMultiplier: Mod(NumberNode(), {
          enabled: (path: Path) => path.pop().push('formula').get() === 'minecraft:uniform_bonus_count'
        }),
        extra: Mod(NumberNode(), {
          enabled: (path: Path) => path.pop().push('formula').get() === 'minecraft:binomial_with_bonus_count'
        }),
        probability: Mod(NumberNode(), {
          enabled: (path: Path) => path.pop().push('formula').get() === 'minecraft:binomial_with_bonus_count'
        })
      }), {
        enabled: (path: Path) => path.push('formula').get() !== 'minecraft:ore_drops'
      }),
      ...conditions
    },
    'minecraft:copy_name': {
      source: EnumNode('copy_source'),
      ...conditions
    },
    'minecraft:copy_nbt': {
      source: EnumNode('copy_source'),
      ops: ListNode(
        ObjectNode({
          source: StringNode(),
          target: StringNode(),
          op: EnumNode(['replace', 'append', 'merge'])
        })
      ),
      ...conditions
    },
    'minecraft:copy_state': {
      block: Resource(EnumNode('block')),
      properties: ListNode(
        StringNode()
      ),
      ...conditions
    },
    'minecraft:enchant_randomly': {
      enchantments: ListNode(
        EnumNode('enchantment')
      ),
      ...conditions
    },
    'minecraft:enchant_with_levels': {
      levels: RangeNode(),
      treasure: BooleanNode(),
      ...conditions
    },
    'minecraft:exploration_map': {
      destination: EnumNode('structure_feature'),
      decoration: EnumNode('map_decoration'),
      zoom: NumberNode({integer: true}),
      search_radius: NumberNode({integer: true}),
      skip_existing_chunks: BooleanNode(),
      ...conditions
    },
    'minecraft:fill_player_head': {
      entity: EnumNode('entity_source'),
      ...conditions
    },
    'minecraft:limit_count': {
      limit: RangeNode(),
      ...conditions
    },
    'minecraft:looting_enchant': {
      count: RangeNode(),
      limit: NumberNode({integer: true}),
      ...conditions
    },
    'minecraft:set_attributes': {
      modifiers: ListNode(
        Reference('attribute-modifier')
      ),
      ...conditions
    },
    'minecraft:set_contents': {
      entries: ListNode(
        Reference('loot-entry')
      ),
      ...conditions
    },
    'minecraft:set_count': {
      count: RangeNode(),
      ...conditions
    },
    'minecraft:set_damage': {
      damage: RangeNode(),
      ...conditions
    },
    'minecraft:set_lore': {
      entity: EnumNode('entity_sources'),
      lore: ListNode(
        JsonNode()
      ),
      replace: BooleanNode(),
      ...conditions
    },
    'minecraft:set_name': {
      entity: EnumNode('entity_sources'),
      name: JsonNode(),
      ...conditions
    },
    'minecraft:set_nbt': {
      tag: StringNode(),
      ...conditions
    },
    'minecraft:set_stew_effect': {
      effects: ListNode(
        ObjectNode({
          type: StringNode(),
          duration: RangeNode()
        })
      ),
      ...conditions
    }
  }
}), {
  category: 'function',
  default: () => ({
    function: 'minecraft:set_count',
    count: 1
  })
}))

SCHEMAS.register('attribute-modifier', ObjectNode({
  attribute: EnumNode('attribute'),
  name: StringNode(),
  amount: RangeNode(),
  operation: EnumNode(['addition', 'multiply_base', 'multiply_total']),
  slot: ListNode(
    EnumNode('slot')
  )
}))

export const LootTableSchema = SCHEMAS.get('loot-table')
