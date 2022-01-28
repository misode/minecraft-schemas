import {
  StringNode as RawStringNode,
  Mod,
  NumberNode,
	NumberEnum,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  NodeChildren,
  Switch,
  Case,
  Opt,
  BooleanNode,
  Reference as RawReference,
	MapNode,
	ListNode,
	ChoiceNode,
} from '@mcschema/core'

export function initModelSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

	const Vec = (length: number, min?: number, max?: number) =>
		ListNode(
			NumberNode({ min, max }),
			{ minLength: length, maxLength: length }
		)

	const Texture = ChoiceNode([
		{
			type: 'alias',
			match: (v: any) => typeof v === 'string' && v.startsWith('#'),
			node: StringNode(),
			change: (v: any) => typeof v === 'string' ? `#${v}` : "#0"
		},
		{
			type: 'reference',
			match: (v: any) => typeof v === 'string',
			node: StringNode({ validator: 'resource', params: { pool: '$texture' } }),
			change: (v: any) => typeof v === 'string' ? v.replace(/^#/, '') : ""
		}
	], { choiceContext: 'texture' })

	schemas.register('model', Mod(ObjectNode({
		parent: Opt(StringNode({ validator: 'resource', params: { pool: '$model' } })),
		ambientocclusion: Opt(BooleanNode()),
		gui_light: Opt(StringNode({ enum: 'gui_light' })),
		textures: Opt(MapNode(
			StringNode(),
			Texture
		)),
		elements: Opt(ListNode(
			ObjectNode({
				from: Vec(3, -16, 32),
				to: Vec(3, -16, 32),
				rotation: Opt(ObjectNode({
					origin: Vec(3),
					axis: StringNode({ enum: 'axis' }),
					angle: NumberEnum({ values: [-45, -22.5, 0, 22.5, 45] }),
					rescale: Opt(BooleanNode())
				})),
				shade: Opt(BooleanNode()),
				faces: MapNode(
					StringNode({ enum: 'direction' }),
					ObjectNode({
						texture: Texture,
						uv: Opt(Vec(4)),
						cullface: Opt(StringNode({ enum: 'direction' })),
						rotation: Opt(NumberNode({ integer: true })),
						tintindex: Opt(NumberNode({ integer: true }))
					})
				)
			}, { context: 'model_element' })
		)),
		display: Opt(MapNode(
			StringNode({ enum: 'display_position' }),
			ObjectNode({
				rotation: Vec(3),
				translation: Vec(3, -80, 80),
				scale: Vec(3, -4, 4)
			}, { context: 'item_transform' })
		)),
		overrides: Opt(ListNode(
			ObjectNode({
				predicate: MapNode(
					StringNode({ enum: 'item_model_predicates' }),
					NumberNode()
				),
				model: StringNode({ validator: 'resource', params: { pool: '$model' } })
			}, { context: 'model_override' })
		))
	}, { context: 'model' }), {
		default: () => ({
			parent: 'minecraft:item/generated',
			textures: {
				layer0: 'minecraft:item/diamond'
			}
		})
	}))
}
