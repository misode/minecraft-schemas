import {
  Reference as RawReference,
  StringNode as RawStringNode,
  ChoiceNode,
  ListNode,
  MapNode,
  Mod,
  ObjectNode,
  Opt,
  SchemaRegistry,
  CollectionRegistry,
  NumberNode
} from '@mcschema/core'
import { InclusiveRange } from './Common'

export function initTrialSpawnerSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('light_limit', ChoiceNode([
    {
      type: 'number',
      node: NumberNode({ integer: true, min: 0, max: 15 }),
      change: (v: any) => Array.isArray(v) ? (v[0] ?? 0) : (v?.min_inclusive ?? 0)
    },
    {
      type: 'list',
      node: ListNode(
        NumberNode({ integer: true, min: 0, max: 15 }),
        { minLength: 2, maxLength: 2 },
      ),
      change: (v: any) => typeof v === 'number' ? [v, v] : [v?.min_inclusive ?? 0, v?.max_inclusive ?? 0]
    },
    {
      type: 'object',
      node: InclusiveRange({ integer: true, min: 0, max: 15 }),
      change: (v: any) => Array.isArray(v) ? {min_inclusive: v[0] ?? 0, max_inclusive: v[1] ?? 0} : {min_inclusive: v ?? 0, max_inclusive: v ?? 0}
    }
  ]))

	schemas.register('trial_spawner', Mod(ObjectNode({
		spawn_range: Opt(NumberNode({ integer: true, min: 1, max: 128 })),
		total_mobs: Opt(NumberNode({ min: 0 })),
		simultaneous_mobs: Opt(NumberNode({ min: 0 })),
		total_mobs_added_per_player: Opt(NumberNode({ min: 0 })),
		simultaneous_mobs_added_per_player: Opt(NumberNode({ min: 0 })),
		ticks_between_spawn: Opt(NumberNode({ integer: true, min: 0 })),
    spawn_potentials: Opt(ListNode(ObjectNode({
      weight: NumberNode({ integer: true, min: 1 }),
      data: ObjectNode({
        entity: ObjectNode({
          id: StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:entity', id: ['pop', { push: 'type' }] } } }),
          // TODO: any data
        }),
        custom_spawn_rules: Opt(ObjectNode({
          block_light_limit: Opt(Reference('light_limit')),
          sky_light_limit: Opt(Reference('light_limit')),
        })),
        equipment: Opt(ObjectNode({
          loot_table: StringNode({ validator: 'resource', params: { pool: '$loot_table' } }),
          slot_drop_chances: Opt(ChoiceNode([
            {
              type: 'number',
              node: NumberNode(),
            },
            {
              type: 'object',
              node: MapNode(
                StringNode({ enum: 'equipment_slot' }), 
                NumberNode()
              )
            }
          ]))
        }))
      }),
    }))),
    loot_tables_to_eject: Opt(ListNode(
      ObjectNode({
        weight: NumberNode({ integer: true, min: 1 }),
        data: StringNode({ validator: 'resource', params: { pool: '$loot_table' } }),
      })
    )),
    items_to_drop_when_ominous: Opt(StringNode({ validator: 'resource', params: { pool: '$loot_table' } })),
	}, { context: 'instrument' }), {
		default: () => ({
			spawn_range: 4,
      total_mobs: 6,
      simultaneous_mobs: 2,
      total_mobs_added_per_player: 2,
      simultaneous_mobs_added_per_player: 1,
      ticks_between_spawn: 40,
      loot_tables_to_eject: [
        {
          data: 'minecraft:spawners/trial_chamber/consumables',
          weight: 1
        },
        {
          data: 'minecraft:spawners/trial_chamber/key',
          weight: 1
        },
      ],
      items_to_drop_when_ominous: 'minecraft:spawners/trial_chamber/items_to_drop_when_ominous'
		})
	}))
}
