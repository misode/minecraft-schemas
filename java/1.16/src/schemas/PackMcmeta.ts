import {
  Force,
  Mod,
  NumberNode,
  ObjectNode,
  Reference,
  SchemaRegistry,
  CollectionRegistry,
} from '@mcschema/core'

const getSimpleString = (jsonText: any): string => jsonText instanceof Array ? getSimpleString(jsonText[0]) : jsonText?.text ?? jsonText?.toString() ?? ''

export function initPackMcmetaSchemas(schemas: SchemaRegistry, _: CollectionRegistry) {
  schemas.register('pack_mcmeta', Mod(ObjectNode({
    pack: Force(Mod(ObjectNode({
      pack_format: Force(Mod(NumberNode({ integer: true, min: 5, max: 5 }), { default: () => 5 })),
      description: Force(Reference(schemas, 'text_component'))
    }), {
      default: () => ({
        pack_format: 5,
        description: ''
      })
    }))
  }), {
    default: () => ({
      pack: {
        pack_format: 5,
        description: ''
      }
    })
  }))
}
