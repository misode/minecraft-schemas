import {
  Mod,
  NumberNode,
  ObjectNode,
  ChoiceNode,
  Reference as RawReference,
  SchemaRegistry,
  CollectionRegistry,
  ListNode,
  StringNode as RawStringNode,
  Opt,
} from '@mcschema/core'

const CURRENT_PACK_FORMAT = 18

export function initPackMcmetaSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('pack_mcmeta', Mod(ObjectNode({
    pack: Mod(ObjectNode({
      pack_format: Mod(NumberNode({ integer: true }), { 
        default: () => CURRENT_PACK_FORMAT,
      }),
      supported_formats: Opt(Reference('pack_format_range')),
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
    })),
    overlays: Opt(ObjectNode({
      entries: ListNode(
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

  schemas.register('pack_format_range', ChoiceNode([
    {
      type: 'number',
      node: NumberNode({ integer: true }),
      change: (v: any) => v[0] ?? 0
    },
    {
      type: 'list',
      node: ListNode(
        NumberNode({ integer: true }),
        { minLength: 2, maxLength: 2 },
      ),
      change: (v: any) => [v ?? 0, v ?? 0]
    }
  ]))
  
  schemas.register('pack_overlay', ObjectNode({
    formats: Reference('pack_format_range'),
    directory: StringNode(),
  }, { context: 'pack_overlay' }))
}
