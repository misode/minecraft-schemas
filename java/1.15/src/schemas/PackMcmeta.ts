import {
  Mod,
  NumberNode,
  ObjectNode,
  Reference,
  SchemaRegistry,
  CollectionRegistry,
} from '@mcschema/core'

export function initPackMcmetaSchemas(schemas: SchemaRegistry, _: CollectionRegistry) {
  const getSimpleString = (jsonText: any): string => jsonText instanceof Array ? getSimpleString(jsonText[0]) : jsonText?.text ?? jsonText?.toString() ?? ''

  schemas.register('pack_mcmeta', Mod(ObjectNode({
    pack: Mod(ObjectNode({
      pack_format: Mod(NumberNode({ integer: true, min: 5, max: 5 }), { default: () => 5 }),
      description: Reference(schemas, 'text_component')
    }), {
      default: () => ({
        pack_format: 5,
        description: ''
      })
    })
  }), {
    default: () => ({
      pack: {
        pack_format: 5,
        description: ''
      }
    })
  }))
}
