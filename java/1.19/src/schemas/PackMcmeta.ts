import {
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  SchemaRegistry,
  CollectionRegistry,
  ListNode,
  StringNode as RawStringNode,
  Opt,
} from '@mcschema/core'

const CURRENT_PACK_FORMAT = 10

export function initPackMcmetaSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('pack_mcmeta', Mod(ObjectNode({
    pack: Mod(ObjectNode({
      pack_format: Mod(NumberNode({ integer: true, min: CURRENT_PACK_FORMAT, max: CURRENT_PACK_FORMAT }), { 
        default: () => CURRENT_PACK_FORMAT,
        canUpdate: (_p, v) => v !== CURRENT_PACK_FORMAT,
        update: () => [{ name: 'pack_format', params: [CURRENT_PACK_FORMAT],  newValue: CURRENT_PACK_FORMAT }]
      }),
      description: Reference('text_component')
    }), {
      default: () => ({
        pack_format: CURRENT_PACK_FORMAT,
        description: ''
      })
    }),
    filter: Opt(ObjectNode({
      block: ListNode(
        ObjectNode({
          namespace: Opt(StringNode({ validator: 'regex_pattern' })),
          path: Opt(StringNode({ validator: 'regex_pattern' })),
        })
      )
    }))
  }), {
    default: () => ({
      pack: {
        pack_format: CURRENT_PACK_FORMAT,
        description: ''
      }
    })
  }))
}
