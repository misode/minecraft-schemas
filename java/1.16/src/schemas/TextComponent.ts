import { BooleanNode, Case, ChoiceNode, EnumNode, Force, ListNode, Mod, NumberNode, ObjectNode, Reference, Resource, SCHEMAS, StringNode, Switch } from '@mcschema/core'

const getSimpleString = (jsonText: any): string => jsonText instanceof Array ? getSimpleString(jsonText[0]) : jsonText?.text ?? jsonText?.toString() ?? ''

SCHEMAS.register('text_component', Mod(ChoiceNode([
  [
    'object',
    Reference('text_component_object'),
    v => v instanceof Array ? (typeof v[0] === 'object' ? v[0] : { text: getSimpleString(v[0]) }) : typeof v === 'object' ? v : { text: getSimpleString(v) }
  ],
  [
    'list',
    Reference('text_component_list'),
    v => [v]
  ],
  [
    'string',
    StringNode({ allowEmpty: true }),
    getSimpleString
  ],
  [
    'number',
    NumberNode(),
    v => {
      const n = parseFloat(getSimpleString(v))
      return isFinite(n) ? n : (!!v ? 1 : 0)
    }
  ],
  [
    'boolean',
    BooleanNode({ radio: true }),
    v => {
      const s = getSimpleString(v)
      return s === 'true' || s === 'false' ? s === 'true' : !!s
    }
  ]
], { context: 'text_component' }), {
  default: () => ({
    text: ""
  })
}))

SCHEMAS.register('text_component_object', Mod(ObjectNode({
  text: StringNode({ allowEmpty: true }),
  translate: StringNode({ allowEmpty: true }),
  with: Reference('text_component_list'),
  score: ObjectNode({
    name: Force(StringNode({ validation: { validator: 'entity', params: { amount: 'single', type: 'entities', isScoreHolder: true } } })),
    objective: Force(StringNode({ validation: { validator: 'objective' } })),
    value: StringNode()
  }, { collapse: true }),
  selector: StringNode({ validation: { validator: 'entity', params: { amount: 'multiple', type: 'entities' } } }),
  keybind: EnumNode('keybind', { additional: true }),
  nbt: StringNode({ validation: { validator: 'nbt_path' } }),
  interpret: BooleanNode(),
  block: StringNode({ validation: { validator: 'vector', params: { dimension: 3, isInteger: true } } }),
  entity: StringNode({ validation: { validator: 'entity', params: { amount: 'single', type: 'entities' } } }),
  storage: Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$storages' } } })),
  extra: Reference('text_component_list'),
  color: StringNode() /* TODO */,
  font: Resource(StringNode()),
  bold: BooleanNode(),
  italic: BooleanNode(),
  underlined: BooleanNode(),
  strikethrough: BooleanNode(),
  obfuscated: BooleanNode(),
  insertion: StringNode(),
  clickEvent: ObjectNode({
    action: Force(EnumNode(['open_url', 'open_file', 'run_command', 'suggest_command', 'change_page', 'copy_to_clipboard'])),
    [Switch]: path => path.push('action'),
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
        value: StringNode({ validation: { validator: 'command', params: { leadingSlash: true } } })
      },
      'suggest_command': {
        value: StringNode({ validation: { validator: 'command', params: { leadingSlash: true, allowPartial: true } } })
      }
    }
  }, { collapse: true }),
  hoverEvent: ObjectNode({
    action: Force(EnumNode(['show_text', 'show_item', 'show_entity'])),
    [Switch]: path => path.push('action'),
    [Case]: {
      'show_text': {
        value: Reference('text_component'),
        contents: Reference('text_component')
      },
      'show_item': {
        value: StringNode({ validation: { validator: 'nbt', params: { module: 'util::InventoryItem' } } }),
        contents: ObjectNode({
          id: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
          count: NumberNode({ integer: true }),
          tag: StringNode({ validation: { validator: 'nbt', params: { registry: { category: 'minecraft:item', id: ['pop', { push: 'id' }] } } } })
        }, { collapse: true })
      },
      'show_entity': {
        value: ObjectNode({
          name: StringNode(),
          type: StringNode(),
          id: StringNode()
        }, { collapse: true }),
        contents: Mod(ObjectNode({
          name: Reference('text_component'),
          type: Force(Resource(EnumNode('entity', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:entity' } } }))),
          id: Force(StringNode({ validation: { validator: 'uuid' } }))
        }, { collapse: true }), {
          default: () => ({
            type: 'minecraft:pig',
            id: '00000001-0001-0001-0001-000000000001'
          })
        })
      }
    }
  }, { collapse: true })
}, { context: 'text_component_object', collapse: true }), {
  default: () => ({
    text: ""
  })
}))

SCHEMAS.register('text_component_list', Mod(ListNode(
  Reference('text_component'), { allowEmpty: true }
), {
  default: () => [{
    text: ""
  }]
}))
