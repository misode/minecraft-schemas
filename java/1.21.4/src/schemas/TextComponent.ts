import {
  BooleanNode,
  Case,
  ChoiceNode,
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
  NodeChildren,
} from '@mcschema/core'


export function initTextComponentSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  const getSimpleString = (v: any): string => v instanceof Array ? getSimpleString(v[0]) : v?.text ?? (typeof v === 'object' ? '' : v?.toString())

  schemas.register('text_component', Mod(ChoiceNode([
    {
      type: 'object',
      node: Reference('text_component_object'),
      change: v => v instanceof Array ? (typeof v[0] === 'object' ? v[0] : { text: getSimpleString(v[0]) }) : typeof v === 'object' ? v : { text: getSimpleString(v) }
    },
    {
      type: 'list',
      node: Reference('text_component_list'),
      change: v => [v]
    },
    {
      type: 'string',
      priority: 1,
      node: StringNode(),
      change: getSimpleString
    },
  ], { context: 'text_component' }), {
    default: () => ({
      text: ""
    })
  }))

  const StyleFields: NodeChildren = {
    color: Opt(StringNode()) /* TODO */,
    shadow_color: Opt(ChoiceNode([
      {
        type: 'number',
        node: NumberNode({ integer: true })
      },
      {
        type: 'list',
        node: ListNode(
          NumberNode({ min: 0, max: 1 }),
          { minLength: 4, maxLength: 4 },
        )
      }
    ])),
    font: Opt(StringNode({ validator: 'resource', params: { pool: 'font' } })),
    bold: Opt(BooleanNode()),
    italic: Opt(BooleanNode()),
    underlined: Opt(BooleanNode()),
    strikethrough: Opt(BooleanNode()),
    obfuscated: Opt(BooleanNode()),
    insertion: Opt(StringNode()),
    clickEvent: Opt(ObjectNode({
      action: StringNode({ enum: ['open_url', 'open_file', 'run_command', 'suggest_command', 'change_page', 'copy_to_clipboard'] }),
      [Switch]: [{ push: 'action' }],
      [Case]: {
        'change_page': {
          value: StringNode()
        },
        'copy_to_clipboard': {
          value: StringNode()
        },
        'open_file': {
          value: StringNode()
        },
        'open_url': {
          value: StringNode()
        },
        'run_command': {
          value: StringNode({ validator: 'command', params: { leadingSlash: true, allowPartial: true } })
        },
        'suggest_command': {
          value: StringNode({ validator: 'command', params: { leadingSlash: true, allowPartial: true } })
        }
      }
    })),
    hoverEvent: Opt(ObjectNode({
      action: StringNode({ enum: ['show_text', 'show_item', 'show_entity'] }),
      [Switch]: [{ push: 'action' }],
      [Case]: {
        'show_text': {
          value: Opt(Reference('text_component')),
          contents: Opt(Reference('text_component'))
        },
        'show_item': {
          value: Opt(StringNode({ validator: 'nbt', params: { module: 'util::InventoryItem' } })),
          contents: Opt(ChoiceNode([
            {
              type: 'string',
              node: Reference('item_non_air'),
              change: v => typeof v === 'object' && typeof v?.id === 'string' ? v : undefined
            },
            {
              type: 'object',
              node: Reference('item_stack'),
              change: v => typeof v === 'string' ? { id: v } : {}
            }
          ]))
        },
        'show_entity': {
          value: Opt(StringNode()),
          contents: Opt(Mod(ObjectNode({
            name: Opt(Reference('text_component')),
            type: StringNode({ validator: 'resource', params: { pool: 'entity_type' } }),
            id: StringNode({ validator: 'uuid' })
          }), {
            default: () => ({
              type: 'minecraft:pig',
              id: '00000001-0001-0001-0001-000000000001'
            })
          }))
        }
      }
    })),
  }

  schemas.register('text_style', ObjectNode({
    ...StyleFields
  }, { context: 'text_component_object' }))

  const CommonFields: NodeChildren = {
    ...StyleFields,
    extra: Opt(Reference('text_component_list'))
  }

  schemas.register('text_component_object', Mod(ChoiceNode([
    {
      type: 'text',
      match: v => typeof v === 'object',
      change: v => ({text: ''}),
      priority: -1,
      node: ObjectNode({
        text: StringNode(),
        ...CommonFields
      })
    },
    {
      type: 'translation',
      match: v => v?.translate !== undefined,
      change: v => ({translate: ''}),
      node: ObjectNode({
        translate: StringNode(),
        fallback: Opt(StringNode()),
        with: Opt(Reference('text_component_list')),
        ...CommonFields
      })
    },
    {
      type: 'score',
      match: v => v?.score !== undefined,
      change: v => ({score: {}}),
      node: ObjectNode({
        score: ObjectNode({
          name: StringNode({ validator: 'entity', params: { amount: 'single', type: 'entities', isScoreHolder: true } }),
          objective: StringNode({ validator: 'objective' }),
          value: Opt(StringNode())
        }),
        ...CommonFields
      })
    },
    {
      type: 'selector',
      match: v => v?.selector !== undefined,
      change: v => ({selector: ''}),
      node: ObjectNode({
        selector: StringNode({ validator: 'entity', params: { amount: 'multiple', type: 'entities' } }),
        separator: Opt(Reference('text_component')),
        ...CommonFields
      })
    },
    {
      type: 'keybind',
      match: v => v?.keybind !== undefined,
      change: v => ({keybind: ''}),
      node: ObjectNode({
        keybind: StringNode({ enum: 'keybind', additional: true }),
        ...CommonFields
      })
    },
    {
      type: 'nbt',
      match: v => v?.nbt !== undefined,
      change: v => ({nbt: ''}),
      node: ObjectNode({
        nbt: StringNode({ validator: 'nbt_path' }),
        block: Opt(StringNode({ validator: 'vector', params: { dimension: 3, isInteger: true } })),
        entity: Opt(StringNode({ validator: 'entity', params: { amount: 'multiple', type: 'entities' } })),
        storage: Opt(StringNode({ validator: 'resource', params: { pool: '$storage' } })),
        interpret: Opt(BooleanNode()),
        separator: Opt(Reference('text_component')),
        ...CommonFields
      })
    }
  ], { context: 'text_component_object', choiceContext: 'text_component.object' }), {
    default: () => ({
      text: ""
    })
  }))

  schemas.register('text_component_list', Mod(ListNode(
    Reference('text_component')
  ), {
    default: () => [{
      text: ""
    }]
  }))
}
