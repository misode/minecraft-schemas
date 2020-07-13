import {
  Case,
  EnumNode,
  Force,
  ListNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference,
  SCHEMAS,
  StringNode,
  Switch,
} from '@mcschema/core'
import { BlockState } from '../Common'

SCHEMAS.register('processor_list', Mod(ObjectNode({
  processors: ListNode(
    Reference('processor')
  )
}, { context: 'processor_list' }), {
  default: () => ({
    processors: [{}]
  })
}))

SCHEMAS.register('processor', ObjectNode({
  processor_type: EnumNode('worldgen/structure_processor', 'minecraft:rule'),
  [Switch]: path => path.push('processor_type'),
  [Case]: {
    'minecraft:block_age': {
      mossiness: NumberNode()
    },
    'minecraft:block_ignore': {
      blocks: Force(ListNode(
        BlockState
      ))
    },
    'minecraft:block_rot': {
      integrity: NumberNode({ min: 0, max: 1 })
    },
    'minecraft:gravity': {
      heightmap: EnumNode('heightmap_type'),
      offset: NumberNode({ integer: true })
    },
    'minecraft:rule': {
      rules: Force(ListNode(
        Reference('processor_rule')
      ))
    }
  }
}))

const posTestFields = {
  min_dist: NumberNode({ min: 0, max: 255, integer: true }),
  max_dist: NumberNode({ min: 0, max: 255, integer: true }),
  min_chance: NumberNode({ min: 0, max: 1 }),
  max_chance: NumberNode({ min: 0, max: 1 })
}

SCHEMAS.register('processor_rule', Mod(ObjectNode({
  position_predicate: ObjectNode({
    predicate_type: Force(EnumNode([
      'minecraft:always_true',
      'minecraft:linear_pos',
      'minecraft:axis_aligned_linear_pos'
    ], 'minecraft:always_true')),
    [Switch]: path => path.push('predicate_type'),
    [Case]: {
      'minecraft:axis_aligned_linear_pos': {
        axis: Force(EnumNode(['x', 'y', 'z'], 'y')),
        ...posTestFields
      },
      'minecraft:linear_pos': posTestFields
    }
  }),
  location_predicate: ObjectNode({
    predicate_type: Force(EnumNode('pos_rule_test', 'minecraft:always_true')),
    [Switch]: path => path.push('predicate_type'),
    [Case]: {
      'minecraft:block_match': {
        block: Force(EnumNode('block', { search: true }))
      }
    }
  }),
  input_predicate: Force(Reference('block_predicate')),
  output_state: Force(BlockState),
  output_nbt: StringNode()
}), {
  default: () => ({
    position_predicate: {},
    location_predicate: {},
    input_predicate: {},
    output_state: {
      Name: 'minecraft:air'
    }
  })
}))

SCHEMAS.register('block_predicate', ObjectNode({
  predicate_type: Force(EnumNode('rule_test', 'minecraft:always_true')),
  [Switch]: path => path.push('predicate_type'),
  [Case]: {
    'minecraft:block_match': {
      block: Force(EnumNode('block', { search: true }))
    },
    'minecraft:blockstate_match': {
      block_state: Force(BlockState)
    },
    'minecraft:random_block_match': {
      block: Force(EnumNode('block', { search: true })),
      probability: Force(NumberNode({ min: 0, max: 1 }))
    },
    'minecraft:random_blockstate_match': {
      block_state: Force(BlockState),
      probability: Force(NumberNode({ min: 0, max: 1 }))
    },
    'minecraft:tag_match': {
      tag: Force(StringNode())
    }
  }
}))
