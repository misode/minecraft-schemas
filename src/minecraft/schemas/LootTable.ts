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
            type: 'item',
            name: 'minecraft:stone'
          }
        ]
      }
    ]
  })
}))

SCHEMAS.register('loot-entry', ObjectNode({
  type: Resource(EnumNode(COLLECTIONS.get('loot-entries'))),
  weight: Mod(NumberNode({ integer: true, min: 1 }), {
    enable: (path: Path) => path.pop().get()?.length > 1
      && !['alternatives', 'group', 'sequence'].includes(path.push('type').get())
  }),
  [Switch]: path => path.push('type').get(),
  [Case]: {
    'alternatives': {
      children: ListNode(
        Reference('loot-entry')
      ),
      ...functionsAndConditions
    },
    'dynamic': {
      name: StringNode(),
      ...functionsAndConditions
    },
    'group': {
      children: ListNode(
        Reference('loot-entry')
      ),
      ...functionsAndConditions
    },
    'item': {
      name: StringNode(),
      ...functionsAndConditions
    },
    'loot_table': {
      name: StringNode(),
      ...functionsAndConditions
    },
    'sequence': {
      children: ListNode(
        Reference('loot-entry')
      ),
      ...functionsAndConditions
    },
    'tag': {
      name: StringNode(),
      expand: BooleanNode(),
      ...functionsAndConditions
    }
  }
}))

SCHEMAS.register('loot-function', Mod(ObjectNode({
  function: Resource(EnumNode(COLLECTIONS.get('loot-functions'))),
  [Switch]: path => path.push('function').get(),
  [Case]: {
    'apply_bonus': {
      enchantment: EnumNode(COLLECTIONS.get('enchantments')),
      formula: EnumNode([
        'uniform_bonus_count',
        'binomial_with_bonus_count',
        'ore_drops'
      ]),
      parameters: Mod(ObjectNode({
        bonusMultiplier: Mod(NumberNode(), {
          enable: (path: Path) => path.pop().push('formula').get() === 'uniform_bonus_count'
        }),
        extra: Mod(NumberNode(), {
          enable: (path: Path) => path.pop().push('formula').get() === 'binomial_with_bonus_count'
        }),
        probability: Mod(NumberNode(), {
          enable: (path: Path) => path.pop().push('formula').get() === 'binomial_with_bonus_count'
        })
      }), {
        enable: (path: Path) => path.push('formula').get() !== 'ore_drops'
      }),
      ...conditions
    },
    'copy_name': {
      source: EnumNode(COLLECTIONS.get('copy-sources')),
      ...conditions
    },
    'copy_nbt': {
      source: EnumNode(COLLECTIONS.get('copy-sources')),
      ops: ListNode(
        ObjectNode({
          source: StringNode(),
          target: StringNode(),
          op: EnumNode(['replace', 'append', 'merge'])
        })
      ),
      ...conditions
    },
    'copy_state': {
      block: Resource(EnumNode(COLLECTIONS.get('blocks'))),
      properties: ListNode(
        StringNode()
      ),
      ...conditions
    },
    'enchant_randomly': {
      enchantments: ListNode(
        EnumNode(COLLECTIONS.get('enchantments'))
      ),
      ...conditions
    },
    'enchant_with_levels': {
      levels: RangeNode(),
      treasure: BooleanNode(),
      ...conditions
    },
    'exploration_map': {
      destination: EnumNode(COLLECTIONS.get('structures')),
      decoration: EnumNode(COLLECTIONS.get('map-decorations')),
      zoom: NumberNode({integer: true}),
      search_radius: NumberNode({integer: true}),
      skip_existing_chunks: BooleanNode(),
      ...conditions
    },
    'fill_player_head': {
      entity: EnumNode(COLLECTIONS.get('entity-sources')),
      ...conditions
    },
    'limit_count': {
      limit: RangeNode(),
      ...conditions
    },
    'looting_enchant': {
      count: RangeNode(),
      limit: NumberNode({integer: true}),
      ...conditions
    },
    'set_attributes': {
      modifiers: ListNode(
        Reference('attribute-modifier')
      ),
      ...conditions
    },
    'set_contents': {
      entries: ListNode(
        Reference('loot-entry')
      ),
      ...conditions
    },
    'set_count': {
      count: RangeNode(),
      ...conditions
    },
    'set_damage': {
      damage: RangeNode(),
      ...conditions
    },
    'set_lore': {
      entity: EnumNode(COLLECTIONS.get('entity-sources')),
      lore: ListNode(
        JsonNode()
      ),
      replace: BooleanNode(),
      ...conditions
    },
    'set_name': {
      entity: EnumNode(COLLECTIONS.get('entity-sources')),
      name: JsonNode(),
      ...conditions
    },
    'set_nbt': {
      tag: StringNode(),
      ...conditions
    },
    'set_stew_effect': {
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
    function: 'set_count',
    count: 1
  })
}))

SCHEMAS.register('attribute-modifier', ObjectNode({
  attribute: EnumNode(COLLECTIONS.get('attributes')),
  name: StringNode(),
  amount: RangeNode(),
  operation: EnumNode([
    'addition',
    'multiply_base',
    'multiply_total'
  ]),
  slot: ListNode(
    EnumNode(COLLECTIONS.get('slots'))
  )
}))

export const LootTableSchema = SCHEMAS.get('loot-table')
