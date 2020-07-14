import { Force, Mod, NumberNode, ObjectNode, Reference, SCHEMAS } from '@mcschema/core'

const getSimpleString = (jsonText: any): string => jsonText instanceof Array ? getSimpleString(jsonText[0]) : jsonText?.text ?? jsonText?.toString() ?? ''

SCHEMAS.register('pack_mcmeta', Mod(ObjectNode({
  pack: Force(Mod(ObjectNode({
    pack_format: Force(Mod(NumberNode({ integer: true, min: 5, max: 5 }), { default: () => 5 })),
    description: Force(Reference('text_component'))
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
