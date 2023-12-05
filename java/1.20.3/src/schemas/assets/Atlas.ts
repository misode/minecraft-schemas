import {
  StringNode as RawStringNode,
  NumberNode,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  Switch,
  Case,
  Opt,
  Reference as RawReference,
  ListNode,
	MapNode,
	StringOrList,
	Mod,
} from '@mcschema/core'

export function initAtlasSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('atlas', ObjectNode({
		sources: ListNode(
			Reference('sprite_source')
		)
	}, { context: 'atlas' }))

  schemas.register('sprite_source', Mod(ObjectNode({
    type: StringNode({ enum: 'sprite_source_type' }),
		[Switch]: [{ push: 'type' }],
		[Case]: {
			'single': {
				resource: StringNode({ validator: 'resource', params: { pool: '$texture' } }),
				sprite: Opt(StringNode({ validator: 'resource', params: { pool: '$texture' } })),
			},
			'directory': {
				source: StringNode(),
				prefix: StringNode(),
			},
			'filter': {
				pattern: Reference('resource_location_pattern'),
			},
			'unstitch': {
				resource: StringNode({ validator: 'resource', params: { pool: '$texture' } }),
				divisor_x: Opt(NumberNode()),
				divisor_y: Opt(NumberNode()),
				regions: ListNode(
					ObjectNode({
						sprite: StringNode({ validator: 'resource', params: { pool: '$texture' } }),
						x: NumberNode(),
						y: NumberNode(),
						width: NumberNode(),
						height: NumberNode(),
					})
				)
			},
			'paletted_permutations': {
				textures: ListNode(
					StringNode({ validator: 'resource', params: { pool: '$texture' } }),
				),
				palette_key: StringNode({ validator: 'resource', params: { pool: '$texture' } }),
				permutations: MapNode(
					StringNode(),
					StringNode({ validator: 'resource', params: { pool: '$texture' } }),
				),
			}
		}
	}, { context: 'sprite_source' }), {
		default: () => ({
			type: 'directory',
			source: 'block',
			prefix: 'block/'
		})
	}))
}
