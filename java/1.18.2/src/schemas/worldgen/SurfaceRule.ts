import {
  StringNode as RawStringNode,
  Mod,
  ObjectNode,
  Reference as RawReference,
  SchemaRegistry,
  CollectionRegistry,
  Switch,
  Case,
  ListNode,
  NumberNode,
  BooleanNode,
} from '@mcschema/core'

export function initSurfaceRuleSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)
  const Reference = RawReference.bind(undefined, schemas)

  schemas.register('material_rule', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/material_rule' } }),
    [Switch]: [ { push: 'type' } ],
    [Case]: {
      'minecraft:block': {
        result_state: Reference('block_state'),
      },
      'minecraft:condition': {
        if_true: Reference('material_condition'),
        then_run: Reference('material_rule')
      },
      'minecraft:sequence': {
        sequence: ListNode(
          Reference('material_rule')
        )
      }
    }
  }, { context: 'material_rule', category: 'pool' }), {
    default: () => ({
      type: 'minecraft:block',
      result_state: {
        Name: 'minecraft:stone'
      }
    })
  }))

  schemas.register('material_condition', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/material_condition' } }),
    [Switch]: [ { push: 'type' } ],
    [Case]: {
      'minecraft:biome': {
        biome_is: ListNode(
          StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } })
        )
      },
      'minecraft:noise_threshold': {
        noise: StringNode({ validator: 'resource', params: { pool: '$worldgen/noise' } }),
        min_threshold: NumberNode(),
        max_threshold: NumberNode()
      },
      'minecraft:not': {
        invert: Reference('material_condition')
      },
      'minecraft:stone_depth': {
        offset: NumberNode({ integer: true }),
        surface_type: StringNode({ enum: 'cave_surface' }),
        add_surface_depth: BooleanNode(),
        secondary_depth_range: NumberNode({ integer: true }),
      },
      'minecraft:vertical_gradient': {
        random_name: StringNode(),
        true_at_and_below: Reference('vertical_anchor'),
        false_at_and_above: Reference('vertical_anchor'),
      },
      'minecraft:water': {
        offset: NumberNode({ integer: true }),
        surface_depth_multiplier: NumberNode({ integer: true, min: -20, max: 20 }),
        add_stone_depth: BooleanNode()
      },
      'minecraft:y_above': {
        anchor: Reference('vertical_anchor'),
        surface_depth_multiplier: NumberNode({ integer: true, min: -20, max: 20 }),
        add_stone_depth: BooleanNode()
      }
    }
  }, { context: 'material_condition' }), {
    default: () => ({
      type: 'minecraft:biome',
      is_biome: 'minecraft:plains'
    })
  }))
}
