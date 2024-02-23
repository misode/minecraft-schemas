import {
  Case,
  StringNode as RawStringNode,
  ListNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
  ChoiceNode,
  INode,
} from '@mcschema/core'
import { IntProvider, Tag } from '../Common'

export let Processors: INode

export function initProcessorListSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  Processors = ChoiceNode([
    {
      type: 'string',
      node: StringNode({ validator: 'resource', params: { pool: '$worldgen/processor_list' }}),
      change: v => undefined
    },
    {
      type: 'list',
      node: ListNode(
        Reference('processor')
      ),
      change: v => (typeof v === 'object' && v !== null && Array.isArray(v.processors))
        ? v.processors
        : [{ processor_type: 'minecraft:nop' }]
    },
    {
      type: 'object',
      node: Reference('processor_list'),
      change: v => ({
        processors: Array.isArray(v)
          ? v
          : [{ processor_type: 'minecraft:nop' }]
      })
    }
  ])

  schemas.register('processor_list', Mod(ObjectNode({
    processors: ListNode(
      Reference('processor')
    )
  }, { context: 'processor_list' }), {
    default: () => ({
      processors: [{
        processor_type: 'minecraft:rule',
        rules: [{
          location_predicate: {
            predicate_type: 'minecraft:always_true'
          },
          input_predicate: {
            predicate_type: 'minecraft:always_true'
          }
        }]
      }]
    })
  }))

  schemas.register('processor', Mod(ObjectNode({
    processor_type: StringNode({ validator: 'resource', params: { pool: 'worldgen/structure_processor' } }),
    [Switch]: [{ push: 'processor_type' }],
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
        integrity: NumberNode({ min: 0, max: 1 }),
        rottable_blocks: Opt(Tag({ resource: 'block' }))
      },
      'minecraft:capped': {
        limit: IntProvider({ min: 1 }),
        delegate: Reference('processor')
      },
      'minecraft:gravity': {
        heightmap: StringNode({ enum: 'heightmap_type' }),
        offset: NumberNode({ integer: true })
      },
      'minecraft:protected_blocks': {
        value: StringNode({ validator: 'resource', params: { pool: 'block', requireTag: true } })
      },
      'minecraft:rule': {
        rules: ListNode(
          Reference('processor_rule')
        )
      }
    }
  }, { category: 'function', context: 'processor' }), {
    default: () => ({
      processor_type: 'minecraft:rule',
      rules: [{
        location_predicate: {
          predicate_type: 'minecraft:always_true'
        },
        input_predicate: {
          predicate_type: 'minecraft:always_true'
        }
      }]
    })
  }))

  schemas.register('processor_rule', Mod(ObjectNode({
    position_predicate: Opt(Reference('pos_rule_test')),
    location_predicate: Reference('rule_test'),
    input_predicate: Reference('rule_test'),
    output_state: Reference('block_state'),
    block_entity_modifier: Opt(Reference('rule_block_entity_modifier'))
  }, { category: 'predicate', context: 'processor_rule' }), {
    default: () => ({
      location_predicate: {
        predicate_type: 'minecraft:always_true'
      },
      input_predicate: {
        predicate_type: 'minecraft:always_true'
      }
    })
  }))

  schemas.register('rule_block_entity_modifier', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'rule_block_entity_modifier' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:append_loot': {
        loot_table: StringNode({ validator: 'resource', params: { pool: '$loot_table' } })
      },
      'minecraft:append_static': {
        data: ObjectNode({}) // TODO: any nbt compound
      }
    }
  }, { context: 'rule_block_entity_modifier' }), {
    default: () => ({
      type: 'minecraft:passthrough',
    })
  }))

  const posTestFields = {
    min_dist: Opt(NumberNode({ min: 0, max: 255, integer: true })),
    max_dist: Opt(NumberNode({ min: 0, max: 255, integer: true })),
    min_chance: Opt(NumberNode({ min: 0, max: 1 })),
    max_chance: Opt(NumberNode({ min: 0, max: 1 }))
  }

  schemas.register('pos_rule_test', ObjectNode({
    predicate_type: StringNode({ validator: 'resource', params: { pool: 'pos_rule_test' } }),
    [Switch]: [{ push: 'predicate_type' }],
    [Case]: {
      'minecraft:axis_aligned_linear_pos': {
        axis: StringNode({ enum: ['x', 'y', 'z'] }),
        ...posTestFields
      },
      'minecraft:linear_pos': posTestFields
    }
  }, { context: 'pos_rule_test', disableSwitchContext: true }))

  schemas.register('rule_test', ObjectNode({
    predicate_type: StringNode({ validator: 'resource', params: { pool: 'rule_test' } }),
    [Switch]: [{ push: 'predicate_type' }],
    [Case]: {
      'minecraft:block_match': {
        block: StringNode({ validator: 'resource', params: { pool: 'block' } })
      },
      'minecraft:blockstate_match': {
        block_state: Reference('block_state')
      },
      'minecraft:random_block_match': {
        block: StringNode({ validator: 'resource', params: { pool: 'block' } }),
        probability: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:random_blockstate_match': {
        block_state: Reference('block_state'),
        probability: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:tag_match': {
        tag: StringNode({ validator: 'resource', params: { pool: '$tag/block' }})
      }
    }
  }, { context: 'rule_test', disableSwitchContext: true }))
}
