import {
  StringNode as RawStringNode,
  ListNode,
  Mod,
  ObjectNode,
  Reference as RawReference,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'

export function initChatTypeSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('chat_type', Mod(ObjectNode({
    chat: Opt(ObjectNode({
      decoration: Opt(Reference('text_decoration')),
    })),
    overlay: Opt(ObjectNode({
      decoration: Opt(Reference('text_decoration')),
    })),
    narration: Opt(ObjectNode({
      decoration: Opt(Reference('text_decoration')),
      priority: StringNode({ enum: ['chat', 'system'] }),
    })),
  }, { context: 'chat_type' }), {
    default: () => ({
      chat: {
        decoration: {
          parameters: ['sender', 'content'],
          translation_key: 'chat.type.text',
          style: {},
        }
      }
    })
  }))

  schemas.register('text_decoration', Mod(ObjectNode({
    translation_key: StringNode(),
    parameters: ListNode(
      StringNode({ enum: ['sender', 'team_name', 'content'] })
    ),
    style: Reference('text_style')
  }, { context: 'text_decoration' }), {
    default: () => ({
      translation_key: 'chat.type.text',
      parameters: ['sender', 'content'],
      style: {},
    })
  }))
}
