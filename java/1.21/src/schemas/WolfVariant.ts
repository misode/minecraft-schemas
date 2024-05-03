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
		wild_texture: StringNode(),
		angry_texture: StringNode(),
		tame_texture: StringNode(),
		biomes: Tag({ resource: '$worldgen/biome' }),
	}, { context: 'wolf_variant' }), {
		default: () => ({
			wild_texture: 'minecraft:entity/wolf/wolf',
			tame_texture: 'minecraft:entity/wolf/wolf_tame',
			angry_texture: 'minecraft:entity/wolf/wolf_angry',
			biomes: 'minecraft:taiga'
		})
	}))
}
