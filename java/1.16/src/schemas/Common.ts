import {
  EnumNode,
  Force,
  ObjectNode,
  MapNode,
  StringNode,
} from '@mcschema/core'

export const BlockState = ObjectNode({
  Name: Force(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } })),
  Properties: MapNode(
    StringNode(),
    StringNode(),
    { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'Name' }] } } }
  )
})

export const FluidState = ObjectNode({
  Name: Force(EnumNode('fluid', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:fluid' } } })),
  Properties: Force(MapNode(
    StringNode(),
    StringNode()
  ))
})
