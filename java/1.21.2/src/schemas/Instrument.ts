import {
  Reference as RawReference,
  Mod,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  NumberNode
} from '@mcschema/core'

export function initInstrumentSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)

	schemas.register('instrument', Mod(ObjectNode({
		sound_event: Reference('sound_event'),
    description: Reference('text_component'),
    range: NumberNode({ min: 0 }),
    use_duration: NumberNode({ min: 0 }),
	}, { context: 'instrument' }), {
		default: () => ({
			sound_event: 'minecraft:item.goat_horn.sound.4',
      description: {
        translate: 'instrument.minecraft.admire_goat_horn',
      },
      range: 256,
      use_duration: 7,
		})
	}))
}
