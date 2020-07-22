import { BooleanNode, EnumNode, Force, ListNode, Mod, ObjectNode, Resource, ResourceType, SCHEMAS, ChoiceNode } from '@mcschema/core'

const TagBase = (type: ResourceType) => Mod(ObjectNode({
  replace: BooleanNode(),
  values: Force(ListNode(
    ChoiceNode([
      {
        type: 'string',
        node: Resource(EnumNode(type, { search: true, additional: true, validation: { validator: 'resource', params: { pool: type, allowTag: true } } })),
        change: v => v.id
      },
      {
        type: 'object',
        node: ObjectNode({
          id: Resource(EnumNode(type, { search: true, additional: true, validation: { validator: 'resource', params: { pool: type, allowTag: true, allowUnknown: true } } })),
          required: BooleanNode({ radio: true })
        }),
        change: v => ({ id: v, required: true })
      }
    ])
  )),
}, { context: 'tag' }), {
  default: () => ({
    values: []
  })
})

SCHEMAS.register('block_tag', TagBase('minecraft:block'))
SCHEMAS.register('entity_type_tag', TagBase('minecraft:entity_type'))
SCHEMAS.register('fluid_tag', TagBase('minecraft:fluid'))
SCHEMAS.register('function_tag', TagBase('$function'))
SCHEMAS.register('item_tag', TagBase('minecraft:item'))
