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
	BooleanNode,
} from '@mcschema/core'

export function initFontSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('font', ObjectNode({
		providers: ListNode(
			Reference('glyph_provider')
		)
	}, { context: 'font' }))

  schemas.register('glyph_provider', Mod(ObjectNode({
    type: StringNode({ enum: 'glyph_provider_type' }),
		filter: Opt(MapNode(
			StringNode({ enum: 'font_option' }),
			BooleanNode(),
		)),
		[Switch]: [{ push: 'type' }],
		[Case]: {
			'bitmap': {
				file: StringNode({ validator: 'resource', params: { pool: '$texture', suffix: '.png' } }),
				height: Opt(NumberNode({ integer: true })),
				ascent: NumberNode({ integer: true }),
				chars: ListNode(
					StringNode(),
					{ minLength: 1 }
				)
			},
			'reference': {
				id: StringNode({ validator: 'resource', params: { pool: '$font' } }),
			},
			'ttf': {
				file: StringNode({ validator: 'resource', params: { pool: '$texture', suffix: '.png' } }),
				size: Opt(NumberNode()),
				oversample: Opt(NumberNode()),
				shift: Opt(ListNode(
					NumberNode({ min: -100, max: 100 }),
					{ minLength: 2, maxLength: 2 }
				)),
				skip: Opt(StringOrList(
					StringNode()
				))
			},
			'space': {
				advances: MapNode(
					StringNode(),
					NumberNode()
				)
			},
			'unihex': {
				hex_file: StringNode(),
				size_overrides: ListNode(
					ObjectNode({
						from: StringNode(),
						to: StringNode(),
						left: NumberNode({ integer: true }),
						right: NumberNode({ integer: true }),
					})
				)
			},
		}
	}, { context: 'glyph_provider' }), {
		default: () => ({
			type: 'bitmap',
		}),
	}))
}
