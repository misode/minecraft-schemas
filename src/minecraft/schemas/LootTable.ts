import { Mod, Force } from '../../nodes/Node';
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
import { SCHEMAS } from '../../Registries';

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
  pools: Force(ListNode(
    ObjectNode({
      rolls: Force(RangeNode({ allowBinomial: true, integer: true, min: 1 })),
      bonus_rolls: RangeNode({ allowBinomial: true }),
      entries: ListNode(
        Reference('loot-entry')
      ),
      ...functionsAndConditions
    }, { context: 'loot_pool' })
  )),
  ...functionsAndConditions
}, { context: 'loot_table' }), {
  default: () => ({
    pools: [{
      rolls: 1,
      entries: [{}]
    }]
  })
}))

SCHEMAS.register('loot-entry', ObjectNode({
  type: Resource(EnumNode('loot_pool_entry_type', 'minecraft:item')),
  weight: Mod(NumberNode({ integer: true, min: 1 }), {
    enabled: (path: Path) => path.pop().get()?.length > 1
      && !['minecraft:alternatives', 'minecraft:group', 'minecraft:sequence'].includes(path.push('type').get())
  }),
  [Switch]: path => path.push('type'),
  [Case]: {
    'minecraft:alternatives': {
      children: ListNode(
        Reference('loot-entry')
      ),
      ...functionsAndConditions
    },
    'minecraft:dynamic': {
      name: Force(StringNode()),
      ...functionsAndConditions
    },
    'minecraft:group': {
      children: ListNode(
        Reference('loot-entry')
      ),
      ...functionsAndConditions
    },
    'minecraft:item': {
      name: Force(Resource(EnumNode('item', { search: true }))),
      ...functionsAndConditions
    },
    'minecraft:loot_table': {
      name: Force(StringNode()),
      ...functionsAndConditions
    },
    'minecraft:sequence': {
      children: ListNode(
        Reference('loot-entry')
      ),
      ...functionsAndConditions
    },
    'minecraft:tag': {
      name: Force(StringNode()),
      expand: BooleanNode(),
      ...functionsAndConditions
    }
  }
}, { context: 'loot_entry' }))

SCHEMAS.register('loot-function', ObjectNode({
  function: Resource(EnumNode('loot_function_type', 'minecraft:set_count')),
  [Switch]: path => path.push('function'),
  [Case]: {
    'minecraft:apply_bonus': {
      enchantment: Force(EnumNode('enchantment')),
      formula: Resource(EnumNode([
        'minecraft:uniform_bonus_count',
        'minecraft:binomial_with_bonus_count',
        'minecraft:ore_drops'
      ], 'minecraft:uniform_bonus_count')),
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
      source: EnumNode('copy_source', 'this'),
      ...conditions
    },
    'minecraft:copy_nbt': {
      source: EnumNode('copy_source', 'this'),
      ops: ListNode(
        ObjectNode({
          source: Force(StringNode()),
          target: Force(StringNode()),
          op: EnumNode(['replace', 'append', 'merge'])
        }, { context: 'nbt_operation' })
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
      levels: Force(RangeNode({ allowBinomial: true })),
      treasure: BooleanNode(),
      ...conditions
    },
    'minecraft:exploration_map': {
      destination: Force(EnumNode('structure_feature')),
      decoration: Force(EnumNode('map_decoration')),
      zoom: NumberNode({ integer: true }),
      search_radius: NumberNode({ integer: true }),
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
      count: RangeNode({ allowBinomial: true }),
      limit: NumberNode({ integer: true }),
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
      count: Force(RangeNode({ allowBinomial: true })),
      ...conditions
    },
    'minecraft:set_damage': {
      damage: Force(RangeNode({ allowBinomial: true })),
      ...conditions
    },
    'minecraft:set_loot_table': {
      name: Force(StringNode()),
      seed: NumberNode({ integer: true })
    },
    'minecraft:set_lore': {
      entity: Force(EnumNode('entity_source', 'this')),
      lore: Force(ListNode(
        JsonNode()
      )),
      replace: BooleanNode(),
      ...conditions
    },
    'minecraft:set_name': {
      entity: Force(EnumNode('entity_source', 'this')),
      name: Force(JsonNode()),
      ...conditions
    },
    'minecraft:set_nbt': {
      tag: Force(StringNode()),
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
}, { category: 'function', context: 'function' }))

SCHEMAS.register('attribute-modifier', ObjectNode({
  attribute: EnumNode('attribute'),
  name: StringNode(),
  amount: RangeNode({ allowBinomial: true }),
  operation: EnumNode(['addition', 'multiply_base', 'multiply_total']),
  slot: ListNode(
    EnumNode('slot')
  )
}, { context: 'attribute_modifier' }))

export const LootTableSchema = SCHEMAS.get('loot-table')
