import {
  BooleanNode,
  StringNode as RawStringNode,
  Mod,
  ObjectNode,
  SwitchNode,
  MapNode,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
  NodeChildren,
  NumberNode,
  ListNode,
  ChoiceNode,
  INode,
  StringOrList,
} from '@mcschema/core'
import { O_NONBLOCK } from 'constants'

export function initBlockSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)

  const Components = (cases: NodeChildren) => 
    SwitchNode(Object.keys(cases).map(c => ({
      match: p => p.last() === c,
      node: cases[c]
    })))
  
  const FalseOrNode = (node: INode<any>) =>
    ChoiceNode([
      { type: 'boolean', node: BooleanNode() },
      { type: 'object', node }
    ])
  
  const TriggerFields: NodeChildren = {
    condition: StringNode(),
    event: StringNode(),
    target: Opt(StringNode())
  }

  schemas.register('block', Mod(ObjectNode({
    format_version: StringNode(),
    'minecraft:block': ObjectNode({
      description: ObjectNode({
        identifier: StringNode({ validator: 'resource', params: { pool: 'block', isDefinition: true }}),
      }),
      components: MapNode(
        StringNode({ validator: 'resource', params: { pool: [], allowUnknown: true } }),
        Components({
          'minecraft:block_light_absorption': NumberNode({ integer: true }),
          'minecraft:block_light_emission': NumberNode({ min: 0, max: 1 }),
          'minecraft:breakonpush': BooleanNode(),
          'minecraft:breathability': StringNode({ enum: ['solid', 'air'], additional: true }),
          'minecraft:destroy_time': NumberNode({ min: 0 }),
          'minecraft:display_name': StringNode(),
          'minecraft:entity_collision': FalseOrNode(
            ObjectNode({
              origin: ListNode(NumberNode()),
              size: ListNode(NumberNode())
            })
          ),
          'minecraft:explosion_resistance': NumberNode(),
          'minecraft:flammable': ObjectNode({
            burn_odds: Opt(NumberNode({ integer: true })),
            flame_odds: Opt(NumberNode({ integer: true }))
          }),
          'minecraft:friction': NumberNode(),
          'minecraft:geometry': StringNode(),
          'minecraft:immovable': BooleanNode(),
          'minecraft:map_color': StringNode(),
          'minecraft:material_instances': MapNode(
            StringNode(),
            StringNode()
          ),
          'minecraft:onlypistonpush': BooleanNode(),
          'minecraft:pick_collision': FalseOrNode(
            ObjectNode({
              origin: ListNode(NumberNode()),
              size: ListNode(NumberNode())
            })
          ),
          'minecraft:placement_filter': ObjectNode({
            allowed_faces: StringNode({ enum: ['up', 'down', 'north', 'south', 'east', 'west', 'side', 'all'] }),
            block_filter: ListNode(
              StringNode({ validator: 'resource', params: { pool: 'block', allowTag: true} })
            )
          }),
          'minecraft:preventsjumping': BooleanNode(),
          'minecraft:random_ticking': ObjectNode({
            on_tick: ObjectNode({
              range: Opt(ListNode(
                NumberNode()
              )),
              ...TriggerFields
            })
          }),
          'minecraft:rotation': ListNode(
            NumberNode()
          ),
          'minecraft:ticking': ObjectNode({
            on_tick: ObjectNode({
              range: Opt(ListNode(
                NumberNode()
              )),
              ...TriggerFields
            }),
            looping: Opt(BooleanNode()),
            range: Opt(ListNode(
              NumberNode()
            ))
          }),
          'minecraft:unit_cube': StringNode(),
          'minecraft:unwalkable': BooleanNode(),
          'minecraft:on_fall_on': ObjectNode({
            min_fall_distance: Opt(NumberNode()),
            ...TriggerFields
          }),
          'minecraft:on_interact': ObjectNode(TriggerFields),
          'minecraft:on_placed': ObjectNode(TriggerFields),
          'minecraft:on_player_destroyed': ObjectNode(TriggerFields),
          'minecraft:on_player_placing': ObjectNode(TriggerFields),
          'minecraft:on_step_off': ObjectNode(TriggerFields),
          'minecraft:on_step_on': ObjectNode(TriggerFields)
        })
      ),
      events: MapNode(
        StringNode(),
        MapNode(
          StringNode({ validator: 'resource', params: { pool: [], allowUnknown: true } }),
          Components({
            'minecraft:add_mob_effect': ObjectNode({
              amplifier: NumberNode({ integer: true, min: 0 }),
              duration: NumberNode({ min: 0 }),
              effect: StringNode(),
              target: Opt(StringNode())
            }),
            'minecraft:damage': ObjectNode({
              amount: NumberNode({ integer: true }),
              target: Opt(StringNode()),
              type: StringNode()
            }),
            'minecraft:decrement_stack': ObjectNode({}),
            'minecraft:die': ObjectNode({
              target: Opt(StringNode())
            }),
            'minecraft:play_effect': ObjectNode({
              data: NumberNode({ integer: true }),
              effect: StringNode(),
              target: Opt(StringNode())
            }),
            'minecraft:play_sound': ObjectNode({
              sound: StringNode(),
              target: Opt(StringNode())
            }),
            'minecraft:remove_mob_effect': ObjectNode({
              effect: StringNode(),
              target: Opt(StringNode())
            }),
            'minecraft:run_command': ObjectNode({
              command: StringOrList(
                StringNode({ validator: 'command', params: {} })
              ),
              target: Opt(StringNode())
            }),
            'minecraft:set_block': ObjectNode({
              block_type: StringNode({ validator: 'resource', params: { pool: 'block' } })
            }),
            'minecraft:set_block_at_pos': ObjectNode({
              block_type: StringNode({ validator: 'resource', params: { pool: 'block' } }),
              block_offset: Opt(ListNode(
                NumberNode()
              ))
            }),
            'minecraft:set_block_property': ObjectNode({
              property: StringNode()
            }),
            'minecraft:spawn_loot': ObjectNode({
              table: StringNode()
            }),
            'minecraft:swing': ObjectNode({}),
            'minecraft:teleport': ObjectNode({
              destination: Opt(ListNode(
                NumberNode()
              )),
              max_range: Opt(ListNode(
                NumberNode()
              )),
              avoid_water: Opt(BooleanNode()),
              land_on_block: Opt(BooleanNode()),
              target: Opt(StringNode())
            }),
            'minecraft:transform_item': ObjectNode({
              transform: StringNode({ validator: 'resource', params: { pool: 'item' } })
            })
          })
        )
      )
    })
  }, { context: 'block' }), {
    default: () => ({
      format_version: '1.16.0'
    })
  }))
}
