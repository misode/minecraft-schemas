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

const CURRENT_PACK_FORMAT = 15

export function initPackMcmetaSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('pack_mcmeta', Mod(ObjectNode({
    pack: Mod(ObjectNode({
      pack_format: Mod(NumberNode({ integer: true }), { 
        default: () => CURRENT_PACK_FORMAT,
      }),
      description: Reference('text_component')
    }), {
      default: () => ({
        pack_format: CURRENT_PACK_FORMAT,
        description: ''
      })
    }),
    features: Opt(ObjectNode({
      enabled: ListNode(
        StringNode({ enum: 'feature_flags' })
      )
    })),
    filter: Opt(ObjectNode({
      block: ListNode(
        Reference('resource_location_pattern')
      )
    }))
  }, { category: 'pack' }), {
    default: () => ({
      pack: {
        pack_format: CURRENT_PACK_FORMAT,
        description: ''
      }
    })
  }))
}
