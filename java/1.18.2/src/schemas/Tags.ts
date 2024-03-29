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
  schemas.register('dimension_tag', TagBase('$dimension'))
  schemas.register('dimension_type_tag', TagBase('$dimension_type'))
  schemas.register('function_tag', TagBase('$function'))
  schemas.register('item_modifier_tag', TagBase('$item_modifier'))
  schemas.register('loot_table_tag', TagBase('$loot_table'))
  schemas.register('predicate_tag', TagBase('$predicate'))
  schemas.register('recipe_tag', TagBase('$recipe'))
  schemas.register('structure_tag', TagBase('$structure'))

  schemas.register('biome_tag', TagBase('$worldgen/biome'))
  schemas.register('configured_carver_tag', TagBase('$worldgen/configured_carver'))
  schemas.register('configured_decorator_tag', TagBase('$worldgen/configured_decorator'))
  schemas.register('configured_feature_tag', TagBase('$worldgen/configured_feature'))
  schemas.register('configured_structure_feature_tag', TagBase('$worldgen/configured_structure_feature'))
  schemas.register('configured_surface_builder_tag', TagBase('$worldgen/configured_surface_builder'))
  schemas.register('density_function_tag', TagBase('$worldgen/density_function'))
  schemas.register('noise_tag', TagBase('$worldgen/noise'))
  schemas.register('noise_settings_tag', TagBase('$worldgen/noise_settings'))
  schemas.register('placed_feature_tag', TagBase('$worldgen/placed_feature'))
  schemas.register('processor_list_tag', TagBase('$worldgen/processor_list'))
  schemas.register('structure_set_tag', TagBase('$worldgen/structure_set'))
  schemas.register('template_pool_tag', TagBase('$worldgen/template_pool'))
}
