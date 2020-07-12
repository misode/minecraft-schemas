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
  name: Force(Resource(EnumNode('worldgen/surface_builder'))),
  config: ObjectNode({
    top_material: BlockState,
    under_material: BlockState,
    underwater_material: BlockState,
  })
}, { context: 'surface_builder' }), {
  default: () => ({
    name: 'minecraft:default',
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
