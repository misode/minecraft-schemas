import {
  StringNode as RawStringNode,
  Mod,
  NumberNode,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  NodeChildren,
  Switch,
  Case,
  Opt,
  BooleanNode,
  Reference as RawReference,
  ChoiceNode,
  MapNode,
  ListNode,
  NumberEnum,
} from '@mcschema/core'

export function initBlockDefinitionSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('block_definition', Mod(ChoiceNode([
    {
      type: 'variants',
      match: (v: any) => v.variants !== undefined,
      node: ObjectNode({
        variants: MapNode(
          StringNode(),
          Reference('model_variant')
        )
      }),
      change: (v: any) => ({ variants: { "": {} } })
    },
    {
      type: 'multipart',
      match: (v: any) => v.multipart !== undefined,
      node: ObjectNode({
        multipart: ListNode(
          ObjectNode({
            when: Opt(Reference('multipart_condition')),
            apply: Reference('model_variant'),
          })
        )
      }),
      change: (v: any) => ({ multipart: { when: {}, apply: {} } })
    }
  ], { context: 'block_definition' }), {
    default: () => ({
      variants: {
        "": {
          model: 'minecraft:block/stone'
        }
      }
    })
  }))

  const VariantChildren: NodeChildren = {
    model: StringNode({ validator: 'resource', params: { pool: '$model' } }),
    x: Opt(NumberEnum({ integer: true, values: [0, 90, 180, 270] })),
    y: Opt(NumberEnum({ integer: true, values: [0, 90, 180, 270] })),
    uvlock: Opt(BooleanNode()),
  }

  schemas.register('model_variant', ChoiceNode([
    {
      type: 'object',
      node: ObjectNode(VariantChildren),
      change: (v: any) => Array.isArray(v) && v.length > 0 ? v[0] : ({})
    },
    {
      type: 'list',
      node: ListNode(
        ObjectNode({
          ...VariantChildren,
          weight: Opt(NumberNode({ integer: true, min: 1 }))
        }, { context: 'model_variant' })
      ),
      change: (v: any) => [{ weight: 1, ...v }]
    }
  ], { context: 'model_variant' }))

  schemas.register('multipart_condition', ChoiceNode([
    {
      type: 'object',
      priority: -1,
      match: () => true,
      node: MapNode(
        StringNode(),
        StringNode()
      ),
      change: (v: any) => typeof v === 'object' && Array.isArray(v?.OR) && v.OR.length > 0 ? v.OR[0] : ({}) 
    },
    {
      type: 'or',
      match: (v: any) => typeof v === 'object' && v?.OR !== undefined,
      node: ObjectNode({
        OR: ListNode(
          Reference('multipart_condition')
        )
      }),
      change: (v: any) => ({ OR: [v ?? {}] })
    }
  ], { context: 'multipart_condition' }))
}
