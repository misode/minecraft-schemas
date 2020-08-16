import {
  Case,
  EnumNode as RawEnumNode,
  ListNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  StringNode,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'

export function initProcessorListSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('processor_list', Mod(ObjectNode({
    processors: ListNode(
      Reference('processor')
    )
  }, { context: 'processor_list' }), {
    default: () => ({
      processors: [{}]
    })
  }))

  schemas.register('processor', ObjectNode({
    processor_type: EnumNode('worldgen/structure_processor', 'minecraft:rule'),
    [Switch]: path => path.push('processor_type'),
    [Case]: {
      'minecraft:block_age': {
        mossiness: NumberNode()
      },
      'minecraft:block_ignore': {
        blocks: ListNode(
          Reference('block_state')
        )
      },
      'minecraft:block_rot': {
        integrity: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:gravity': {
        heightmap: EnumNode('heightmap_type'),
        offset: NumberNode({ integer: true })
      },
      'minecraft:rule': {
        rules: ListNode(
          Reference('processor_rule')
        )
      }
    }
  }, { context: 'processor' }))

  schemas.register('processor_rule', Mod(ObjectNode({
    position_predicate: Opt(Reference('pos_rule_test')),
    location_predicate: Reference('rule_test'),
    input_predicate: Reference('rule_test'),
    output_state: Reference('block_state'),
    output_nbt: StringNode()
  }, { context: 'processor_rule' }), {
    default: () => ({
      location_predicate: {},
      input_predicate: {},
      output_state: {
        Name: 'minecraft:air'
      }
    })
  }))

  const posTestFields = {
    min_dist: NumberNode({ min: 0, max: 255, integer: true }),
    max_dist: NumberNode({ min: 0, max: 255, integer: true }),
    min_chance: NumberNode({ min: 0, max: 1 }),
    max_chance: NumberNode({ min: 0, max: 1 })
  }

  schemas.register('pos_rule_test', ObjectNode({
    predicate_type: EnumNode('pos_rule_test', 'minecraft:always_true'),
    [Switch]: path => path.push('predicate_type'),
    [Case]: {
      'minecraft:axis_aligned_linear_pos': {
        axis: EnumNode(['x', 'y', 'z'], 'y'),
        ...posTestFields
      },
      'minecraft:linear_pos': posTestFields
    }
  }, { context: 'pos_rule_test', disableSwitchContext: true }))

  schemas.register('rule_test', ObjectNode({
    predicate_type: EnumNode('rule_test', 'minecraft:always_true'),
    [Switch]: path => path.push('predicate_type'),
    [Case]: {
      'minecraft:block_match': {
        block: EnumNode('block', { search: true })
      },
      'minecraft:blockstate_match': {
        block_state: Reference('block_state')
      },
      'minecraft:random_block_match': {
        block: EnumNode('block', { search: true }),
        probability: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:random_blockstate_match': {
        block_state: Reference('block_state'),
        probability: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:tag_match': {
        tag: StringNode()
      }
    }
  }, { context: 'rule_test', disableSwitchContext: true }))
}
