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
  SwitchNode,
  INode,
  ModelPath,
} from '@mcschema/core'
import { Tag } from './Common'

export function initPredicatesSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('item_predicate', ObjectNode({
    items: Opt(Tag({ resource: 'item' })),
    count: Reference('int_bounds'),
    components: Opt(Reference('data_component_predicate')),
    predicates: Opt(MapNode(
      StringNode({ validator: 'resource', params: { pool: 'item_sub_predicate_type' } }),
      SwitchNode([
        ...Object.entries<INode>({
          'minecraft:custom_data': ChoiceNode([
            {
              type: 'string',
              node: StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:item', id: ['pop', 'pop', { push: 'item' }] } } }),
            },
            {
              type: 'object',
              node: ObjectNode({}) // TODO: any unsafe data
            },
          ]),
          'minecraft:damage': ObjectNode({
            durability: Opt(Reference('int_bounds')),
            damage: Opt(Reference('int_bounds')),
          }),
          'minecraft:enchantments': ListNode(
            Reference('enchantment_predicate')
          ),
          'minecraft:potion_contents': Tag({ resource: 'potion' }),
          'minecraft:stored_enchantments': ListNode(
            Reference('enchantment_predicate')
          ),
        }).map(([key, value]) => ({
          match: (path: ModelPath) => {
            let last = path.last().toString()
            if (!last.startsWith('minecraft:')) last = 'minecraft:' + last
            return last === key
          },
          node: value,
        })),
        {
          match: () => true,
          node: ObjectNode({}),
        },
      ]),
    ))
  }, { context: 'item' }))

  schemas.register('enchantment_predicate', ObjectNode({
    enchantment: Opt(StringNode({ validator: 'resource', params: { pool: 'enchantment' } })),
    levels: Reference('int_bounds')
  }, { context: 'enchantment' }))

  schemas.register('block_predicate', ObjectNode({
    blocks: Opt(Tag({ resource: 'block' })),
    nbt: Opt(StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:block', id: ['pop', { push: 'block' }] } } })),
    state: Opt(MapNode(
      StringNode(),
      StringNode(),
      { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'block' }] } } }
    ))
  }, { context: 'block' }))

  schemas.register('fluid_predicate', ObjectNode({
    fluids: Opt(Tag({ resource: 'fluid' })),
    state: Opt(MapNode(
      StringNode(),
      StringNode()
    ))
  }, { context: 'fluid' }))

  schemas.register('location_predicate', ObjectNode({
    position: Opt(ObjectNode({
      x: Reference('float_bounds'),
      y: Reference('float_bounds'),
      z: Reference('float_bounds')
    })),
    biomes: Opt(Tag({ resource: '$worldgen/biome' })),
    structures: Opt(Tag({ resource: '$worldgen/structure' })),
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
    type: Opt(Tag({ resource: 'entity_type' })),
    type_specific: Opt(ObjectNode({
      type: StringNode({ validator: 'resource', params: { pool: 'entity_sub_predicate_type' } }),
      [Switch]: [{ push: 'type' }],
      [Case]: {
        'minecraft:axolotl': {
          variant: Opt(StringNode({ enum: 'axolotl_variant' }))
        },
        'minecraft:boat': {
          variant: Opt(StringNode({ enum: 'boat_variant' }))
        },
        'minecraft:cat': {
          variant: Opt(Tag({ resource: 'cat_variant' }))
        },
        'minecraft:fishing_hook': {
          in_open_water: Opt(BooleanNode())
        },
        'minecraft:fox': {
          variant: Opt(StringNode({ enum: 'fox_variant' }))
        },
        'minecraft:frog': {
          variant: Opt(Tag({ resource: 'frog_variant' }))
        },
        'minecraft:horse': {
          variant: Opt(StringNode({ enum: 'horse_variant' }))
        },
        'minecraft:lightning': {
          blocks_set_on_fire: Opt(Reference('int_bounds')),
          entity_struck: Opt(Reference('entity_predicate'))
        },
        'minecraft:llama': {
          variant: Opt(StringNode({ enum: 'llama_variant' }))
        },
        'minecraft:mooshroom': {
          variant: Opt(StringNode({ enum: 'mooshroom_variant' }))
        },
        'minecraft:painting': {
          variant: Opt(Tag({ resource: 'painting_variant' }))
        },
        'minecraft:parrot': {
          variant: Opt(StringNode({ enum: 'parrot_variant' }))
        },
        'minecraft:player': {
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
        'minecraft:rabbit': {
          variant: Opt(StringNode({ enum: 'rabbit_variant' }))
        },
        'minecraft:raider': {
          has_raid: Opt(BooleanNode()),
          is_captain: Opt(BooleanNode()),
        },
        'minecraft:slime': {
          size: Reference('int_bounds')
        },
        'minecraft:tropical_fish': {
          variant: Opt(StringNode({ enum: 'tropical_fish_variant' }))
        },
        'minecraft:villager': {
          variant: Opt(StringNode({ validator: 'resource', params: { pool: 'villager_type' } }))
        },
        'minecraft:wolf': {
          variant: Opt(Tag({ resource: '$wolf_variant' })),
        },
      }
    })),
    nbt: Opt(StringNode({ validator: 'nbt', params: { registry: { category: 'minecraft:entity', id: ['pop', { push: 'type' }] } } })),
    team: Opt(StringNode({ validator: 'team' })),
    location: Opt(Reference('location_predicate')),
    stepping_on: Opt(Reference('location_predicate')),
    distance: Opt(Reference('distance_predicate')),
    slots: Opt(MapNode(
      StringNode({ enum: 'slot_range', additional: true }),
      Reference('item_predicate')
    )),
    flags: Opt(ObjectNode({
      is_on_fire: Opt(BooleanNode()),
      is_sneaking: Opt(BooleanNode()),
      is_sprinting: Opt(BooleanNode()),
      is_swimming: Opt(BooleanNode()),
      is_baby: Opt(BooleanNode())
    })),
    equipment: Opt(MapNode(
      StringNode({ enum: 'equipment_slot' }),
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
