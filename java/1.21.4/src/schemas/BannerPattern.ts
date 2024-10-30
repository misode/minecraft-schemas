import {
  StringNode as RawStringNode,
  Mod,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry
} from '@mcschema/core'

export function initBannerPatternSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)

	schemas.register('banner_pattern', Mod(ObjectNode({
		asset_id: StringNode(),
		translation_key: StringNode(),
	}, { context: 'banner_pattern' }), {
		default: () => ({
			asset_id: 'minecraft:globe',
			translation_key: 'block.minecraft.banner.globe'
		})
	}))
}
