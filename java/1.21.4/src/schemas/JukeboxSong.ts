import {
  Reference as RawReference,
  Mod,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  NumberNode
} from '@mcschema/core'

export function initJukeboxSongSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)

	schemas.register('jukebox_song', Mod(ObjectNode({
		sound_event: Reference('sound_event'),
    description: Reference('text_component'),
    length_in_seconds: NumberNode({ min: 1 }),
    comparator_output: NumberNode({ integer: true, min: 0, max: 15 }),
	}, { context: 'jukebox_song' }), {
		default: () => ({
			sound_event: 'minecraft:music_disc.cat',
      description: {
        translate: 'jukebox_song.minecraft.cat',
      },
      length_in_seconds: 185,
      comparator_output: 2,
		})
	}))
}
