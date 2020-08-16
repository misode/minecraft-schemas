import {
  BooleanNode,
  EnumNode as RawEnumNode,
  ListNode,
  Mod,
  ObjectNode,
  Resource,
  ResourceType,
  ChoiceNode,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'

export function initTagsSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const EnumNode = RawEnumNode.bind(undefined, collections)

  const TagBase = (type: ResourceType) => Mod(ObjectNode({
    replace: Opt(BooleanNode()),
    values: ListNode(
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
            required: BooleanNode()
          }),
          change: v => ({ id: v })
        }
      ])
    ),
  }, { context: 'tag' }), {
    default: () => ({
      values: []
    })
  })

  schemas.register('block_tag', TagBase('minecraft:block'))
  schemas.register('entity_type_tag', TagBase('minecraft:entity_type'))
  schemas.register('fluid_tag', TagBase('minecraft:fluid'))
  schemas.register('function_tag', TagBase('$function'))
  schemas.register('item_tag', TagBase('minecraft:item'))
}
