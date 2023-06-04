import {
  BooleanNode,
  StringNode as RawStringNode,
  ListNode,
  MapNode,
  ObjectNode,
  Opt,
  Reference as RawReference,
  Switch,
  Case,
  SchemaRegistry,
  ChoiceNode,
  CollectionRegistry,
  NumberNode,
} from '@mcschema/core'

export function initPredicatesSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  const StateChoice = ChoiceNode([
    {
      type: 'string',
      node: StringNode(),
      change: v => (typeof v === 'boolean' || typeof v === 'number') ? v.toString() : ''
    },
    {
      type: 'number',
      node: NumberNode(),
      change: v => (typeof v === 'string') ? parseInt(v) : 0
    },
    {
      type: 'object',
      node: ObjectNode({
        min: Opt(NumberNode({ integer: true })),
        max: Opt(NumberNode({ integer: true }))
      }),
      change: v => (typeof v === 'number') ? ({ min: v, max: v }) : ({})
    },
    {
      type: 'boolean',
      node: BooleanNode(),
      change: v => v === 'true' || v === 1
    }
  ])

  schemas.register('item_predicate', ObjectNode({
    items: Opt(ListNode(
      StringNode({ validator: 'resource', params: { pool: 'item' } })
    )),
    tag: Opt(StringNode({ validator: 'resource', params: { pool: '$tag/item' } })),
    count: Reference('int_bounds'),
    durability: Reference('int_bounds'),
    potion: Opt(StringNode({ validator: 'resource', params: { pool: 'potion' } })),
    nbt: Opt(StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:item', id: ['pop', { push: 'item' }] } } })),
    enchantments: Opt(ListNode(
      Reference('enchantment_predicate')
    ))
  }, { context: 'item' }))

  schemas.register('enchantment_predicate', ObjectNode({
    enchantment: Opt(StringNode({ validator: 'resource', params: { pool: 'enchantment' } })),
    levels: Reference('int_bounds')
  }, { context: 'enchantment' }))

  schemas.register('block_predicate', ObjectNode({
    blocks: Opt(ListNode(
      StringNode({ validator: 'resource', params: { pool: 'block' } })
    )),
    tag: Opt(StringNode({ validator: 'resource', params: { pool: '$tag/block' } })),
    nbt: Opt(StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:block', id: ['pop', { push: 'block' }] } } })),
    state: Opt(MapNode(
      StringNode(),
      StateChoice,
      { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'block' }] } } }
    ))
  }, { context: 'block' }))

  schemas.register('fluid_predicate', ObjectNode({
    fluid: Opt(StringNode({ validator: 'resource', params: { pool: 'fluid' } })),
    tag: Opt(StringNode({ validator: 'resource', params: { pool: '$tag/fluid' } })),
    state: Opt(MapNode(
      StringNode(),
      StateChoice
    ))
  }, { context: 'fluid' }))

  schemas.register('location_predicate', ObjectNode({
    position: Opt(ObjectNode({
      x: Reference('float_bounds'),
      y: Reference('float_bounds'),
      z: Reference('float_bounds')
    })),
    biome: Opt(StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } })),
    structure: Opt(StringNode({ validator: 'resource', params: { pool: '$worldgen/structure' } })),
    dimension: Opt(StringNode({ validator: 'resource', params: { pool: '$dimension' } })),
    light: Opt(ObjectNode({
      light: Reference('int_bounds')
    })),
    smokey: Opt(BooleanNode()),
    block: Opt(Reference('block_predicate')),
    fluid: Opt(Reference('fluid_predicate'))
  }, { context: 'location' }))

  schemas.register('statistic_predicate', ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'stat_type' } }),
    stat: StringNode(),
    value: Reference('int_bounds'),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:mined': {
        stat: StringNode({ validator: 'resource', params: { pool: 'block' } })
      },
      'minecraft:crafted': {
        stat: StringNode({ validator: 'resource', params: { pool: 'item' } })
      },
      'minecraft:used': {
        stat: StringNode({ validator: 'resource', params: { pool: 'item' } })
      },
      'minecraft:broken': {
        stat: StringNode({ validator: 'resource', params: { pool: 'item' } })
      },
      'minecraft:picked_up': {
        stat: StringNode({ validator: 'resource', params: { pool: 'item' } })
      },
      'minecraft:dropped': {
        stat: StringNode({ validator: 'resource', params: { pool: 'item' } })
      },
      'minecraft:killed': {
        stat: StringNode({ validator: 'resource', params: { pool: 'entity_type' } })
      },
      'minecraft:killed_by': {
        stat: StringNode({ validator: 'resource', params: { pool: 'entity_type' } })
      },
      'minecraft:custom': {
        stat: StringNode({ validator: 'resource', params: { pool: 'custom_stat' } })
      }
    }
  }))

  schemas.register('status_effect_predicate', ObjectNode({
    amplifier: Reference('int_bounds'),
    duration: Reference('int_bounds'),
    ambient: Opt(BooleanNode()),
    visible: Opt(BooleanNode())
  }, { context: 'status_effect' }))

  schemas.register('distance_predicate', ObjectNode({
    x: Reference('float_bounds'),
    y: Reference('float_bounds'),
    z: Reference('float_bounds'),
    absolute: Reference('float_bounds'),
    horizontal: Reference('float_bounds')
  }, { context: 'distance' }))

  schemas.register('entity_predicate', ObjectNode({
    type: Opt(StringNode({ validator: 'resource', params: { pool: 'entity_type', allowTag: true } })),
    type_specific: Opt(ObjectNode({
      type: StringNode({ enum: 'type_specific_type' }),
      [Switch]: [{ push: 'type' }],
      [Case]: {
        'axolotl': {
          variant: Opt(StringNode({ enum: 'axolotl_variant' }))
        },
        'boat': {
          variant: Opt(StringNode({ enum: 'boat_variant' }))
        },
        'cat': {
          variant: Opt(StringNode({ validator: 'resource', params: { pool: 'cat_variant' } }))
        },
        'fishing_hook': {
          in_open_water: Opt(BooleanNode())
        },
        'fox': {
          variant: Opt(StringNode({ enum: 'fox_variant' }))
        },
        'frog': {
          variant: Opt(StringNode({ validator: 'resource', params: { pool: 'frog_variant' } }))
        },
        'horse': {
          variant: Opt(StringNode({ enum: 'horse_variant' }))
        },
        'lightning': {
          blocks_set_on_fire: Opt(Reference('int_bounds')),
          entity_struck: Opt(Reference('entity_predicate'))
        },
        'llama': {
          variant: Opt(StringNode({ enum: 'llama_variant' }))
        },
        'mooshroom': {
          variant: Opt(StringNode({ enum: 'mooshroom_variant' }))
        },
        'painting': {
          variant: Opt(StringNode({ validator: 'resource', params: { pool: 'painting_variant' } }))
        },
        'parrot': {
          variant: Opt(StringNode({ enum: 'parrot_variant' }))
        },
        'player': {
          gamemode: Opt(StringNode({ enum: 'gamemode' })),
          level: Reference('int_bounds'),
          advancements: Opt(MapNode(
            StringNode({ validator: 'resource', params: { pool: '$advancement' } }),
            ChoiceNode([
              {
                type: 'boolean',
                node: BooleanNode(),
                change: () => true
              },
              {
                type: 'object',
                node: MapNode(
                  StringNode(),
                  BooleanNode()
                )
              }
            ])
          )),
          recipes: Opt(MapNode(
            StringNode({ validator: 'resource', params: { pool: '$recipe' } }),
            BooleanNode()
          )),
          stats: Opt(ListNode(
            Reference('statistic_predicate')
          )),
          looking_at: Opt(Reference('entity_predicate'))
        },
        'rabbit': {
          variant: Opt(StringNode({ enum: 'rabbit_variant' }))
        },
        'slime': {
          size: Reference('int_bounds')
        },
        'tropical_fish': {
          variant: Opt(StringNode({ enum: 'tropical_fish_variant' }))
        },
        'villager': {
          variant: Opt(StringNode({ validator: 'resource', params: { pool: 'villager_type' } }))
        },
      }
    })),
    nbt: Opt(StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:entity', id: ['pop', { push: 'type' }] } } })),
    team: Opt(StringNode({ validator: 'team' })),
    location: Opt(Reference('location_predicate')),
    stepping_on: Opt(Reference('location_predicate')),
    distance: Opt(Reference('distance_predicate')),
    flags: Opt(ObjectNode({
      is_on_fire: Opt(BooleanNode()),
      is_sneaking: Opt(BooleanNode()),
      is_sprinting: Opt(BooleanNode()),
      is_swimming: Opt(BooleanNode()),
      is_baby: Opt(BooleanNode())
    })),
    equipment: Opt(MapNode(
      StringNode({ enum: 'slot' }),
      Reference('item_predicate')
    )),
    vehicle: Opt(Reference('entity_predicate')),
    passenger: Opt(Reference('entity_predicate')),
    targeted_entity: Opt(Reference('entity_predicate')),
    effects: Opt(MapNode(
      StringNode({ validator: 'resource', params: { pool: 'mob_effect' } }),
      Reference('status_effect_predicate')
    ))
  }, { context: 'entity' }))

  schemas.register('damage_source_predicate', ObjectNode({
    tags: Opt(ListNode(
      ObjectNode({
        id: StringNode({ validator: 'resource', params: { pool: '$tag/damage_type' } }),
        expected: BooleanNode(),
      }, { context: 'tag_predicate' }),
    )),
    source_entity: Opt(Reference('entity_predicate')),
    direct_entity: Opt(Reference('entity_predicate'))
  }, { context: 'damage_source' }))

  schemas.register('damage_predicate', ObjectNode({
    dealt: Reference('float_bounds'),
    taken: Reference('float_bounds'),
    blocked: Opt(BooleanNode()),
    source_entity: Opt(Reference('entity_predicate')),
    type: Opt(Reference('damage_source_predicate'))
  }, { context: 'damage' }))
}
