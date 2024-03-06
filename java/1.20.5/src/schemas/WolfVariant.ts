import {
  StringNode as RawStringNode,
  Mod,
  ObjectNode,
  Opt,
  SchemaRegistry,
  CollectionRegistry
} from '@mcschema/core'
import { Tag } from './Common'

export function initWolfVariantSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)

	schemas.register('wolf_variant', Mod(ObjectNode({
		texture: StringNode(),
		angry_texture: StringNode(),
		tame_texture: StringNode(),
		biomes: Tag({ resource: '$worldgen/biome' }),
	}, { context: 'wolf_variant' }), {
		default: () => ({
			texture: 'minecraft:textures/entity/wolf/wolf.png',
			tame_texture: 'minecraft:textures/entity/wolf/wolf_tame.png',
			angry_texture: 'minecraft:textures/entity/wolf/wolf_angry.png',
			biomes: 'minecraft:taiga'
		})
	}))
}
