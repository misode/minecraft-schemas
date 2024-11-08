import {
  StringNode as RawStringNode,
  Mod,
  NumberNode,
  ChoiceNode,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  Switch,
  Case,
  Opt,
  BooleanNode,
  Reference as RawReference,
  ListNode,
} from '@mcschema/core'

export function initItemDefinitionSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('item_definition', Mod(ObjectNode({
    model: Reference('item_model'),
  }, { context: 'item_definition' }), { default: () => ({
    model: {
      type: 'minecraft:model',
    },
  })}))

  schemas.register('item_model', ObjectNode({
      type: StringNode({ enum: 'item_model_type' }),
      [Switch]: [{ push: 'type' }],
      [Case]: {
        'minecraft:model': {
          model: StringNode({ validator: 'resource', params: { pool: '$model' } }),
          tints: Opt(ListNode(
            Reference('tint_source'),
          ))
        },
        'minecraft:special': {
          base: StringNode({ validator: 'resource', params: { pool: '$model' } }),
          model: Reference('special_item_model'),
        },
        'minecraft:composite': {
          models: ListNode(Reference('item_model'))
        },
        'minecraft:condition': {
          property: StringNode({ validator: 'resource', params: { pool: collections.get('model_condition_type') } }),
          component: Mod(StringNode({ validator: 'resource', params: { pool: 'data_component_type' } }), {
            enabled: path => path.push('property').get() === 'minecraft:has_component'
          }),
          index: Mod(Opt(NumberNode({ integer: true })), {
            enabled: path => path.push('property').get() === 'minecraft:custom_model_data'
          }),
          on_true: Reference('item_model'),
          on_false: Reference('item_model')
        },
        'minecraft:select': {
          property: StringNode({ validator: 'resource', params: { pool: collections.get('select_model_property_type') } }),
          block_state_property: Mod(StringNode(), {
            enabled: path => path.push('property').get() === 'minecraft:block_state'
          }),
          index: Mod(NumberNode({ integer: true }), {
            enabled: path => path.push('property').get() === 'minecraft:custom_model_data'
          }),
          cases: ListNode(
            ObjectNode({
              when: ChoiceNode([
                {
                  type: 'string',
                  node: StringNode(),
                  change: v => Array.isArray(v) && v.length > 0 ? v[0] : ""
                },
                {
                  type: 'list',
                  node: ListNode(StringNode()),
                  change: v => typeof v === 'string' ? [v] : []
                }
              ]),
              model: Reference('item_model')
            })
          ),
          fallback: Opt(Reference('item_model'))
        },
        'minecraft:range_dispatch': {
          property: StringNode({ validator: 'resource', params: { pool: collections.get('numeric_model_property_type') } }),
          index: Mod(Opt(NumberNode({ integer: true })), {
            enabled: path => path.push('property').get() === 'minecraft:custom_model_data'
          }),
          normalize: Mod(Opt(BooleanNode()), {
            enabled: path => path.push('property').get() === 'minecraft:damage' || path.push('property').get() === 'minecraft:count'
          }),
          natural_only: Mod(Opt(BooleanNode()), {
            enabled: path => path.push('property').get() === 'minecraft:time'
          }),
          target: Mod(StringNode({ enum: ['spawn', 'lodestone', 'recovery'] }), {
            enabled: path => path.push('property').get() === 'minecraft:compass'
          }),
          wobble: Mod(Opt(BooleanNode()), {
            enabled: path => path.push('property').get() === 'minecraft:time' || path.push('property').get() === 'minecraft:compass'
          }),
          remaining: Mod(Opt(BooleanNode()), {
            enabled: path => path.push('property').get() === 'minecraft:use_duration'
          }),
          period: Mod(Opt(NumberNode()), {
            enabled: path => path.push('property').get() === 'minecraft:use_cycle'
          }),
          scale: Opt(NumberNode()),
          entries: ListNode(
            ObjectNode({
              threshold: NumberNode(),
              model: Reference('item_model')
            }),
          ),
          fallback: Opt(Reference('item_model'))
        }
      }
  }, { context: 'item_model' }))

  schemas.register('tint_source', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: collections.get('tint_source_type') } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:constant': {
        value: Reference('color_rgb')
      },
      'minecraft:dye': {
        default: Reference('color_rgb')
      },
      'minecraft:firework': {
        default: Reference('color_rgb')
      },
      'minecraft:grass': {
        temperature: NumberNode({ min: 0, max: 1}), 
        downfall : NumberNode({ min: 0, max: 1}), 
      },
      'minecraft:potion': {
        default: Reference('color_rgb')
      },
      'minecraft:map_color': {
        default: Reference('color_rgb')
      },
      'minecraft:custom_model_data': {
        index: Opt(NumberNode({ integer: true }))
      },
    }
  }, { context: 'tint_source' }), {
    default: () => ({
      type: 'minecraft:constant',
      value: 0,
    })
  }))

  schemas.register('special_item_model', ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: collections.get('special_model_type') } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:bed': {
        texture: StringNode()
      },
      'minecraft:banner': {
        color: StringNode({ enum: 'dye_color' })
      },
      'minecraft:chest': {
        texture: StringNode(),
        openness: Opt(NumberNode({ min: 0, max: 1}))
      },
      'minecraft:head': {
        kind: StringNode({ enum: 'skull_kind' })
      },
      'minecraft:shulker_box': {
        texture: StringNode(),
        openness: Opt(NumberNode({ min: 0, max: 1})),
        orientation: Opt(StringNode({ enum: 'direction' }))
      },
    }
  }, { context: 'special_item_model' }))
}
