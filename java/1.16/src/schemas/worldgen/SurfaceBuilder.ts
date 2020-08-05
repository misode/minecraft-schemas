import {
  EnumNode,
  Force,
  Mod,
  ObjectNode,
  Resource,
  SCHEMAS,
} from '@mcschema/core'
import { BlockState } from '../Common'

SCHEMAS.register('configured_surface_builder', Mod(ObjectNode({
  type: Force(Resource(EnumNode('worldgen/surface_builder'))),
  config: Force(ObjectNode({
    top_material: Force(BlockState),
    under_material: Force(BlockState),
    underwater_material: Force(BlockState),
  }))
}, { context: 'surface_builder' }), {
  default: () => ({
    type: 'minecraft:default',
    config: {
      top_material: {
        Name: 'minecraft:grass_block',
        Properties: {
          snowy: 'false'
        }
      },
      under_material: {
        Name: 'minecraft:dirt'
      },
      underwater_material: {
        Name: 'minecraft:gravel'
      }
    }
  })
}))
