import {
  BooleanNode,
  StringNode as RawStringNode,
  ListNode,
  Mod,
  ObjectNode,
  ResourceType,
  ChoiceNode,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'

export function initTagsSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)

  const TagBase = (type: ResourceType) => Mod(ObjectNode({
    replace: Opt(BooleanNode()),
    values: ListNode(
      ChoiceNode([
        {
          type: 'string',
          node: StringNode({ validator: 'resource', params: { pool: type, allowTag: true } }),
          change: v => v.id
        },
        {
          type: 'object',
          node: ObjectNode({
            id: StringNode({ validator: 'resource', params: { pool: type, allowTag: true, allowUnknown: true } }),
            required: BooleanNode()
          }),
          change: v => ({ id: v })
        }
      ])
    ),
  }, { context: 'tag' }), {
    default: () => ({
      values: []
    })
  })

  schemas.register('block_tag', TagBase('block'))
  schemas.register('entity_type_tag', TagBase('entity_type'))
  schemas.register('fluid_tag', TagBase('fluid'))
  schemas.register('function_tag', TagBase('$function'))
  schemas.register('game_event_tag', TagBase('game_event'))
  schemas.register('item_tag', TagBase('item'))

  schemas.register('advancement_tag', TagBase('$advancement'))
  schemas.register('chat_type_tag', TagBase('$chat_type'))
  schemas.register('damage_type_tag', TagBase('$damage_type'))
  schemas.register('dimension_tag', TagBase('$dimension'))
  schemas.register('dimension_type_tag', TagBase('$dimension_type'))
  schemas.register('function_tag', TagBase('$function'))
  schemas.register('item_modifier_tag', TagBase('$item_modifier'))
  schemas.register('loot_table_tag', TagBase('$loot_table'))
  schemas.register('predicate_tag', TagBase('$predicate'))
  schemas.register('recipe_tag', TagBase('$recipe'))
  schemas.register('structure_tag', TagBase('$structure'))
  schemas.register('trim_material_tag', TagBase('$trim_material'))
  schemas.register('trim_pattern_tag', TagBase('$trim_pattern'))

  schemas.register('biome_tag', TagBase('$worldgen/biome'))
  schemas.register('configured_carver_tag', TagBase('$worldgen/configured_carver'))
  schemas.register('configured_feature_tag', TagBase('$worldgen/configured_feature'))
  schemas.register('structure_tag', TagBase('$worldgen/structure'))
  schemas.register('density_function_tag', TagBase('$worldgen/density_function'))
  schemas.register('flat_level_generator_preset_tag', TagBase('$worldgen/flat_level_generator_preset'))
  schemas.register('multi_noise_biome_source_parameter_list_tag', TagBase('$worldgen/multi_noise_biome_source_parameter_list'))
  schemas.register('noise_tag', TagBase('$worldgen/noise'))
  schemas.register('noise_settings_tag', TagBase('$worldgen/noise_settings'))
  schemas.register('placed_feature_tag', TagBase('$worldgen/placed_feature'))
  schemas.register('processor_list_tag', TagBase('$worldgen/processor_list'))
  schemas.register('structure_set_tag', TagBase('$worldgen/structure_set'))
  schemas.register('template_pool_tag', TagBase('$worldgen/template_pool'))
  schemas.register('world_preset_tag', TagBase('$worldgen/world_preset'))

  schemas.register('banner_pattern_tag', TagBase('banner_pattern'))
  schemas.register('cat_variant_tag', TagBase('cat_variant'))
  schemas.register('enchantment_tag', TagBase('enchantment'))
  schemas.register('instrument_tag', TagBase('instrument'))
  schemas.register('painting_variant_tag', TagBase('painting_variant'))
  schemas.register('point_of_interest_type_tag', TagBase('point_of_interest_type'))
}
