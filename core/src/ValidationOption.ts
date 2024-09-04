import { RelativePath } from "./model/Path"

export type ValidationOption =
  | BlockStateKeyValidationOption
  | BlockStateMapValidationOption
  | CommandValidationOption
  | EntityValidationOption
  | NbtValidationOption
  | NbtPathValidationOption
  | ObjectiveValidationOption
  | ResourceValidationOption
  | TeamValidationOption
  | UuidValidationOption
  | VectorValidationOption
  | RegexPatternValidationOption

type BlockStateKeyValidationOption = {
  validator: 'block_state_key',
  params: {
    /**
     * A relative path from the node with this validator to 
     * the string node containing a block ID.
     */
    id: RelativePath
  }
}

type BlockStateMapValidationOption = {
  validator: 'block_state_map',
  params: {
    /**
     * A relative path from the node with this validator to 
     * the string node containing a block ID.
     */
    id: RelativePath
  }
}

type CommandValidationOption = {
  validator: 'command',
  params: {
    /**
     * Whether the command should begin with a slash (`/`).
     * Both ways will be valid when the value is `undefined`.
     */
    leadingSlash?: boolean,
    /**
     * Whether unfinished commands are valid. 
     * 
     * No errors will show when the command doesn't begin with a slash
     * but both `leadingSlash` and `allowPartial` are set to `true`.
     */
    allowPartial?: boolean
  }
}

type EntityValidationOption = {
  validator: 'entity',
  params: {
    /**
     * The amount of entities the selector can select.
     */
    amount: 'single' | 'multiple',
    /**
     * The type of entities the selector can select.
     */
    type: 'players' | 'entities',
    /**
     * If this is a score holder. Could potentially affect
     * the length validation of the entity name.
     */
    isScoreHolder?: boolean
  }
}

type NbtdocCategory = 'minecraft:block' | 'minecraft:entity' | 'minecraft:item'

/**
 * Get the nbtdoc category from a loot copy source. 
 * 
 * The category for `this`, `killer`, and `killer_player` should be `minecraft:entity`, while
 * the category for `block_entity` should be `minecraft:block`
 */
type NbtdocCategoryGeter = {
  getter: 'copy_source',
  /**
   * Relative path to the field that contains a loot copy source.
   */
  path: RelativePath
}

type NbtValidationOption = {
  validator: 'nbt',
  params: {
    /**
     * An nbtdoc path to the relevant module. Path segments should be
     * separated by `::`.
     */
    module?: string,
    /**
     * An nbtdoc registry for selecting the relevant module.
     */
    registry?: {
      /**
       * The category of this registry.
       */
      category: NbtdocCategory,
      /**
       * A relative path from the node with this validator to 
       * the string node containing a block/entity/item ID.
       */
      id?: RelativePath,
    }
    /** 
     * If this NBT is a predicate. If set to `true`, types are 
     * checked strictly, e.g. cannot use integers in places which 
     * require shorts.
     */
    isPredicate?: boolean
  }
}

type NbtPathValidationOption = {
  validator: 'nbt_path',
  params?: {
    /**
     * The category of an nbtdoc registry for selecting the relevant module.
     */
    category: NbtdocCategory | NbtdocCategoryGeter,
    /**
     * A block/entity/item ID.
     */
    id?: string
  }
}

type ObjectiveValidationOption = {
  validator: 'objective',
  params?: {}
}

type ResourceValidationOption = {
  validator: 'resource',
  params: {
    /**
     * The possible values of this resource location. 
     * 
     * If the type is `string[]`, all values in the array must be prefixed with `minecraft:`.
     */
    pool: ResourceType | string[],
    /**
     * Whether tag resource locations (starting with a hash symbol (`#`)) are allowed. The client
     * implementation is encouraged to use the values for the corresponding tag type to validate
     * these tag resource locations.
     * 
     * | Pool type               | Tag type           |
     * | ----------------------- | ------------------ |
     * | `$function`             | `$tag/function`    |
     * | `minecraft:block`       | `$tag/block`       |
     * | `minecraft:entity_type` | `$tag/entity_type` |
     * | `minecraft:fluid`       | `$tag/fluid`       |
     * | `minecraft:item`        | `$tag/item`        |
     */
    allowTag?: boolean,
    /**
     * Whether only tag resource locations (starting with a hash symbol (`#`)) are allowed.
     */
    requireTag?: boolean,
    /**
     * Whether resource locations not contained in `pool` are allowed.
     */
    allowUnknown?: boolean,
    /**
     * Whether the field is a definition for the `pool`. Any resource will be allowed.
     */
    isDefinition?: boolean,
    /**
     * Require a suffix on each resource location.
     */
    suffix?: string,
  }
}

type TeamValidationOption = {
  validator: 'team',
  params?: {}
}

type UuidValidationOption = {
  validator: 'uuid',
  params?: {}
}

type VectorValidationOption = {
  validator: 'vector',
  params: {
    /**
     * The element amount of this vector.
     */
    dimension: 2 | 3 | 4,
    /**
     * If only integers are allowed in absolute elements, i.e. is a block position.
     */
    isInteger?: boolean,
    /**
     * If local elements (starting with `^`) are disallowed.
     */
    disableLocal?: boolean,
    /**
     * If relative elements (starting with `~`) are disallowed.
     */
    disableRelative?: boolean,
    /**
     * The minimum value for absolute elements.
     */
    min?: number,
    /**
     * The maximum value for absolute elements.
     */
    max?: number
  }
}

type RegexPatternValidationOption = {
  validator: 'regex_pattern',
  params?: {}
}

export type ResourceType =
  | '$advancement'
  | '$bossbar'
  | '$chat_type'
  | '$damage_type'
  | '$dimension'
  | '$dimension_type'
  | '$font'
  | '$function'
  | '$item_modifier'
  | '$loot_table'
  | '$model'
  | '$predicate'
  | '$recipe'
  | '$storage'
  | '$structure'
  | '$tag/banner_pattern'
  | '$tag/block'
  | '$tag/damage_type'
  | '$tag/entity_type'
  | '$tag/fluid'
  | '$tag/function'
  | '$tag/instrument'
  | '$tag/item'
  | '$tag/worldgen/biome'
  | '$tag/worldgen/configured_carver'
  | '$tag/worldgen/configured_decorator'
  | '$tag/worldgen/configured_feature'
  | '$tag/worldgen/configured_structure_feature'
  | '$tag/worldgen/configured_surface_builder'
  | '$tag/worldgen/density_function'
  | '$tag/worldgen/flat_level_generator_preset'
  | '$tag/worldgen/noise'
  | '$tag/worldgen/noise_settings'
  | '$tag/worldgen/placed_feature'
  | '$tag/worldgen/processor_list'
  | '$tag/worldgen/structure'
  | '$tag/worldgen/structure_set'
  | '$tag/worldgen/template_pool'
  | '$tag/worldgen/world_preset'
  | '$texture'
  | '$trim_material'
  | '$trim_pattern'
  | '$wolf_variant'
  | '$worldgen/biome'
  | '$worldgen/configured_carver'
  | '$worldgen/configured_decorator'
  | '$worldgen/configured_feature'
  | '$worldgen/configured_structure_feature'
  | '$worldgen/configured_surface_builder'
  | '$worldgen/density_function'
  | '$worldgen/flat_level_generator_preset'
  | '$worldgen/multi_noise_biome_source_parameter_list'
  | '$worldgen/noise'
  | '$worldgen/noise_settings'
  | '$worldgen/placed_feature'
  | '$worldgen/processor_list'
  | '$worldgen/structure'
  | '$worldgen/structure_set'
  | '$worldgen/template_pool'
  | '$worldgen/world_preset'
  | 'attribute'
  | 'banner_pattern'
  | 'block'
  | 'block_entity_type'
  | 'block_predicate_type'
  | 'cat_variant'
  | 'consume_effect_type'
  | 'custom_stat'
  | 'data_component_type'
  | 'enchantment'
  | 'enchantment_effect_component_type'
  | 'enchantment_entity_effect_type'
  | 'enchantment_level_based_value_type'
  | 'enchantment_location_based_effect_type'
  | 'enchantment_provider'
  | 'enchantment_provider_type'
  | 'enchantment_value_effect_type'
  | 'entity_sub_predicate_type'
  | 'entity_type'
  | 'float_provider_type'
  | 'fluid'
  | 'font'
  | 'frog_variant'
  | 'game_event'
  | 'height_provider_type'
  | 'instrument'
  | 'int_provider_type'
  | 'item'
  | 'item_sub_predicate_type'
  | 'jukebox_song'
  | 'loot_condition_type'
  | 'loot_function_type'
  | 'loot_nbt_provider_type'
  | 'loot_number_provider_type'
  | 'loot_pool_entry_type'
  | 'loot_score_provider_type'
  | 'mob_effect'
  | 'pos_rule_test'
  | 'painting_variant'
  | 'particle_type'
  | 'point_of_interest_type'
  | 'potion'
  | 'recipe_serializer'
  | 'rule_block_entity_modifier'
  | 'rule_test'
  | 'stat_type'
  | 'trigger_type'
  | 'villager_profession'
  | 'villager_type'
  | 'worldgen/block_state_provider_type'
  | 'worldgen/block_placer_type'
  | 'worldgen/biome_source'
  | 'worldgen/carver'
  | 'worldgen/chunk_generator'
  | 'worldgen/decorator'
  | 'worldgen/density_function_type'
  | 'worldgen/feature'
  | 'worldgen/feature_size_type'
  | 'worldgen/foliage_placer_type'
  | 'worldgen/material_rule'
  | 'worldgen/material_condition'
  | 'worldgen/placement_modifier_type'
  | 'worldgen/pool_alias_binding'
  | 'worldgen/root_placer_type'
  | 'worldgen/structure_feature'
  | 'worldgen/structure_placement'
  | 'worldgen/structure_pool_element'
  | 'worldgen/structure_processor'
  | 'worldgen/structure_type'
  | 'worldgen/surface_builder'
  | 'worldgen/tree_decorator_type'
  | 'worldgen/trunk_placer_type'
