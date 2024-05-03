import {
  StringNode as RawStringNode,
  Mod,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  NumberNode
} from '@mcschema/core'

export function initPaintingVariantSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)

	schemas.register('painting_variant', Mod(ObjectNode({
		asset_id: StringNode(),
		width: NumberNode({ integer: true, min: 1, max: 16 }),
		height: NumberNode({ integer: true, min: 1, max: 16 }),
	}, { context: 'painting_variant' }), {
		default: () => ({
			asset_id: 'minecraft:backyard',
      width: 3,
      height: 4,
		})
	}))
}
