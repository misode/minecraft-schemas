import {
  StringNode as RawStringNode,
  Mod,
  NumberNode,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'

export function initDamageTypeSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)

	schemas.register('damage_type', Mod(ObjectNode({
		message_id: StringNode(),
		exhaustion: NumberNode(),
		scaling: StringNode({ enum: 'damage_scaling' }),
		effects: Opt(StringNode({ enum: 'damage_effects' })),
		death_message_type: Opt(StringNode({ enum: 'death_message_type' })),
	}, { context: 'damage_type' }), {
		default: () => ({
			message_id: 'generic',
			exhaustion: 0,
			scaling: 'when_caused_by_living_non_player',
		})
	}))
}
