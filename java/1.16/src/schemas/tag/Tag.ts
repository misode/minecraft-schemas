import { BooleanNode, EnumNode, Force, ListNode, Mod, ObjectNode, Resource, ResourceType } from '@mcschema/core'

export const TagBase = (type: ResourceType) => Mod(ObjectNode({
    replace: BooleanNode(),
    values: Force(ListNode(Resource(EnumNode(type, { search: true, additional: true, validation: { validator: 'resource', params: { pool: type, allowTag: true } } })))),
}, { context: 'tag' }), {
    default: () => ({
        values: []
    })
})
