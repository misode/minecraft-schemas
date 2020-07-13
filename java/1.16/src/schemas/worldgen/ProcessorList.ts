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
    'minecraft:rule': {
      rules: ListNode(
        Reference('processor_rule')
      )
    },
    'minecraft:block_rot': {
      integrity: NumberNode()
    }
  }
}))

SCHEMAS.register('processor_rule', Mod(ObjectNode({
  position_predicate: ObjectNode({
    predicate_type: Force(EnumNode([
      'minecraft:always_true',
      'minecraft:axis_aligned_linear_pos'
    ], 'minecraft:always_true')),
    [Switch]: path => path.push('predicate_type'),
    [Case]: {
      'minecraft:axis_aligned_linear_pos': {
        axis: Force(EnumNode(['x', 'y', 'z'], 'y')),
        min_dist: NumberNode({ min: 0, max: 255, integer: true }),
        max_dist: NumberNode({ min: 0, max: 255, integer: true }),
        min_chance: NumberNode({ min: 0, max: 1 }),
        max_chance: NumberNode({ min: 0, max: 1 })
      }
    }
  }),
  location_predicate: ObjectNode({
    predicate_type: Force(EnumNode([
      'minecraft:always_true',
      'minecraft:block_match'
    ], 'minecraft:always_true')),
    [Switch]: path => path.push('predicate_type'),
    [Case]: {
      'minecraft:block_match': {
        block: Force(EnumNode('block', { search: true }))
      }
    }
  }),
  input_predicate: Force(Reference('block_predicate')),
  output_state: Force(BlockState)
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
  predicate_type: Force(EnumNode([
    'minecraft:always_true',
    'minecraft:block_match',
    'minecraft:tag_match',
    'minecraft:blockstate_match',
    'minecraft:random_block_match'
  ], 'minecraft:always_true')),
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
    'minecraft:tag_match': {
      tag: Force(StringNode())
    }
  }
}))
