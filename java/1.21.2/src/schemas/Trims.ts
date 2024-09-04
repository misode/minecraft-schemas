import {
  StringNode as RawStringNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
	MapNode,
	BooleanNode,
} from '@mcschema/core'

export function initTrimsSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

	schemas.register('trim_material', Mod(ObjectNode({
		asset_name: StringNode(),
		description: Reference('text_component'),
		ingredient: StringNode({ validator: 'resource', params: { pool: 'item' } }),
		item_model_index: NumberNode(),
		override_armor_materials: Opt(MapNode(
			StringNode(),
			StringNode(),
		)),
	}, { context: 'trim_material' }), {
		default: () => ({
			asset_name: 'copper',
			description: {
				translate: 'trim_material.minecraft.copper',
				color: '#B4684D',
			},
			ingredient: 'minecraft:copper_ingot',
			item_model_index: 0.5,
		})
	}))

	schemas.register('trim_pattern', Mod(ObjectNode({
		asset_id: StringNode({ validator: 'resource', params: { pool: [], allowUnknown: true } }),
		description: Reference('text_component'),
		template_item: StringNode({ validator: 'resource', params: { pool: 'item' } }),
        decal: Opt(BooleanNode()),
	}, { context: 'trim_pattern' }), {
		default: () => ({
			asset_id: 'minecraft:coast',
			description: {
				translate: 'trim_pattern.minecraft.coast',
			},
			template_item: 'minecraft:coast_armor_trim_smithing_template',
		})
	}))
}
