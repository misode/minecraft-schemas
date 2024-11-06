import {
  StringNode as RawStringNode,
  Mod,
  NumberNode,
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

export function initItemModelSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('item_model', Mod(ObjectNode({
    models: ObjectNode({
      type: StringNode({ enum: 'item_model_type' }),
      [Switch]: [{ push: 'type' }],
      [Case]: {
        'minecraft:model': {
          model: StringNode({ validator: 'resource', params: { pool: '$model' } }),
          tints: Opt(ListNode(ObjectNode({
            type: StringNode({ enum: 'tint_source_type' }),
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
              'minecrat:grass': {
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
          })))
        },
        'minecraft:special': {
          base: StringNode({ validator: 'resource', params: { pool: '$model' } }),
          model: ObjectNode({
            type: StringNode({ enum: 'special_model_type' }),
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
                color: StringNode({ enum: 'skull_kind' })
              },
              'minecraft:shulker_box': {
                texture: StringNode(),
                openness: Opt(NumberNode({ min: 0, max: 1})),
                orientation: Opt(StringNode({ enum: 'direction' }))
              },
            }
          })
        },
        'minecraft:composite': {
          models: ListNode(Reference('item_model'))
        },
        'minecraft:condition': {
          property: StringNode({ enum: 'model_condition_type' }),
          [Switch]: [{ push: 'property' }],
          [Case]: {
            'minecraft:has_component': {
              component: StringNode({ validator: 'resource', params: { pool: 'data_component_type' } })
            },
            'minecraft:custom_model_data': {
              index: Opt(NumberNode({ integer: true }))
            }
          },
          on_true: Reference('item_model'),
          on_false: Reference('item_model')
        },
        'minecraft:select': {
          property: StringNode({ enum: 'select_model_property_type' }),
          [Switch]: [{ push: 'property' }],
          [Case]: {
            'minecraft:block_state': {
              'block_state_property': StringNode()
            },
            'minecraft:custom_model_data': {
              index: Opt(NumberNode({ integer: true }))
            }
          },
          cases: ObjectNode({
            when: StringNode(),
            model: Reference('item_model')
          }),
          fallback: Opt(Reference('item_model'))
        },
        'minecraft:range_dispatch': {
          property: StringNode({ enum: 'numeric_model_property_type' }),
          [Switch]: [{ push: 'property' }],
          [Case]: {
            'minecraft:custom_model_data': {
              index: Opt(NumberNode({ integer: true }))
            },
            'minecraft:damage': {
              normalize: Opt(BooleanNode())
            },
            'minecraft:count': {
              normalize: Opt(BooleanNode())
            },
            'minecraft:time': {
              wobble: Opt(BooleanNode()),
              natural_only: Opt(BooleanNode())
            },
            'minecraft:compass': {
              target: StringNode({ enum: ['spawn', 'lodestone', 'recovery'] }),
              wobble: Opt(BooleanNode())
            },
            'minecraft:use_duration': {
              remaining: Opt(BooleanNode())
            },
            'minecraft:use_cycle': {
              period: Opt(NumberNode())
            }
          },
          scale: Opt(NumberNode()),
          entries: ObjectNode({
            threshold: NumberNode(),
            model: Reference('item_model')
          }),
          fallback: Opt(Reference('item_model'))
        }
      }
    })
  })))
}