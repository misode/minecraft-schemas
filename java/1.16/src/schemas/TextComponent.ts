import { BooleanNode, Case, ChoiceNode, EnumNode, Force, ListNode, Mod, NumberNode, ObjectNode, Reference, Resource, SCHEMAS, StringNode, Switch } from '@mcschema/core'

const getSimpleString = (jsonText: any): string => jsonText instanceof Array ? getSimpleString(jsonText[0]) : jsonText?.text ?? jsonText?.toString() ?? ''

SCHEMAS.register('text-component', Mod(ChoiceNode([
  [
    'object',
    Reference('text-component-object'),
    v => v instanceof Array ? (typeof v[0] === 'object' ? v[0] : { text: getSimpleString(v[0]) }) : typeof v === 'object' ? v : { text: getSimpleString(v) }
  ],
  [
    'list',
    Reference('text-component-list'),
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
], { context: 'text-component' }), {
  default: () => ({
    text: ""
  })
}))

SCHEMAS.register('text-component-object', Mod(ObjectNode({
  text: StringNode({ allowEmpty: true }),
  translate: StringNode({ allowEmpty: true }),
  with: Reference('text-component-list'),
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
  extra: Reference('text-component-list'),
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
      'open_url': { 
        value: StringNode() 
      },
      'open_file': { 
        value: StringNode() 
      },
      'run_command': {
        value: StringNode({ validation: { validator: 'command', params: { leadingSlash: true } } })
      },
      'suggest_command': {
        value: StringNode({ validation: { validator: 'command', params: { leadingSlash: true, allowPartial: true } } })
      },
      'change_page': { 
        value: StringNode() 
      },
      'copy_to_clipboard': { 
        value: StringNode() 
      }
    }
  })
}, { context: 'text-component-object', collapse: true }), {
  default: () => ({
    text: ""
  })
}))

SCHEMAS.register('text-component-list', Mod(ListNode(
  Reference('text-component'), { allowEmpty: true }
), {
  default: () => [{
    text: ""
  }]
}))

export const TextComponentSchema = SCHEMAS.get('text-component')
