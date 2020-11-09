import { CollectionRegistry } from '@mcschema/core'

export function initCollections(collections: CollectionRegistry) {
  collections.register('advancement_trigger', [
    'minecraft:bee_nest_destroyed',
    'minecraft:bred_animals',
    'minecraft:brewed_potion',
    'minecraft:changed_dimension',
    'minecraft:channeled_lightning',
    'minecraft:construct_beacon',
    'minecraft:consume_item',
    'minecraft:cured_zombie_villager',
    'minecraft:effects_changed',
    'minecraft:enchanted_item',
    'minecraft:enter_block',
    'minecraft:entity_hurt_player',
    'minecraft:entity_killed_player',
    'minecraft:filled_bucket',
    'minecraft:fishing_rod_hooked',
    'minecraft:hero_of_the_village',
    'minecraft:impossible',
    'minecraft:inventory_changed',
    'minecraft:item_durability_changed',
    'minecraft:item_used_on_block',
    'minecraft:killed_by_crossbow',
    'minecraft:levitation',
    'minecraft:location',
    'minecraft:nether_travel',
    'minecraft:placed_block',
    'minecraft:player_generates_container_loot',
    'minecraft:player_hurt_entity',
    'minecraft:player_interacted_with_entity',
    'minecraft:player_killed_entity',
    'minecraft:recipe_unlocked',
    'minecraft:shot_crossbow',
    'minecraft:slept_in_bed',
    'minecraft:slide_down_block',
    'minecraft:summoned_entity',
    'minecraft:tame_animal',
    'minecraft:target_hit',
    'minecraft:tick',
    'minecraft:thrown_item_picked_up_by_entity',
    'minecraft:used_ender_eye',
    'minecraft:used_totem',
    'minecraft:villager_trade',
    'minecraft:voluntary_exile'
  ])

  collections.register('dimension', [
    'minecraft:overworld',
    'minecraft:the_nether',
    'minecraft:the_end'
  ])

  collections.register('dimension_type', [
    'minecraft:overworld',
    'minecraft:the_nether',
    'minecraft:the_end'
  ])

  collections.register('keybind', [
    'key.advancements',
    'key.attack',
    'key.back',
    'key.chat',
    'key.command',
    'key.drop',
    'key.forward',
    'key.fullscreen',
    'key.hotbar.1',
    'key.hotbar.2',
    'key.hotbar.3',
    'key.hotbar.4',
    'key.hotbar.5',
    'key.hotbar.6',
    'key.hotbar.7',
    'key.hotbar.8',
    'key.hotbar.9',
    'key.inventory',
    'key.jump',
    'key.left',
    'key.loadToolbarActivator',
    'key.pickItem',
    'key.playerlist',
    'key.right',
    'key.saveToolbarActivator',
    'key.screenshot',
    'key.smoothCamera',
    'key.sneak',
    'key.spectatorOutlines',
    'key.sprint',
    'key.swapOffhand',
    'key.togglePerspective',
    'key.use'
  ])

  collections.register('slot', [
    'mainhand',
    'offhand',
    'head',
    'chest',
    'legs',
    'feet'
  ])

  collections.register('gamemode', [
    'survival',
    'creative',
    'adventure',
    'spectator'
  ])

  collections.register('worldgen/noise_settings', [
    'minecraft:overworld',
    'minecraft:nether',
    'minecraft:end',
    'minecraft:amplified',
    'minecraft:caves',
    'minecraft:floating_islands'
  ])

  collections.register('entity_source', [
    'this',
    'direct_killer',
    'killer',
    'killer_player'
  ])

  collections.register('copy_source', [
    'block_entity',
    'this',
    'killer',
    'killer_player'
  ])

  collections.register('loot_table_apply_bonus_formula', [
    'minecraft:uniform_bonus_count',
    'minecraft:binomial_with_bonus_count',
    'minecraft:ore_drops'
  ])

  collections.register('map_decoration', [
    'mansion',
    'monument',
    'player',
    'frame',
    'red_marker',
    'blue_marker',
    'target_x',
    'target_point',
    'player_off_map',
    'player_off_limits',
    'red_x',
    'banner_white',
    'banner_orange',
    'banner_magenta',
    'banner_light_blue',
    'banner_yellow',
    'banner_lime',
    'banner_pink',
    'banner_gray',
    'banner_light_gray',
    'banner_cyan',
    'banner_purple',
    'banner_blue',
    'banner_brown',
    'banner_green',
    'banner_red',
    'banner_black'
  ])

  collections.register('recipe_group', [
    'bed',
    'light_gray_dye',
    'iron_ingot',
    'wooden_stairs',
    'black_dye',
    'stained_terracotta',
    'dyed_bed',
    'magenta_dye',
    'bark',
    'rabbit_stew',
    'light_blue_dye',
    'wooden_fence_gate',
    'planks',
    'stained_glass',
    'wooden_door',
    'stained_glass_pane',
    'wooden_fence',
    'sticks',
    'concrete_powder',
    'wooden_pressure_plate',
    'boat',
    'brown_dye',
    'yellow_dye',
    'bonemeal',
    'red_dye',
    'wooden_trapdoor',
    'wooden_button',
    'gold_ingot',
    'pink_dye',
    'wooden_slab',
    'orange_dye',
    'carpet',
    'sign',
    'wool',
    'sugar',
    'blue_dye',
    'white_dye',
    'banner',
    'netherite_ingot'
  ])

  collections.register('worldgen/configured_feature', [
    'minecraft:acacia',
    'minecraft:bamboo_light',
    'minecraft:bamboo_vegetation',
    'minecraft:bamboo',
    'minecraft:basalt_blobs',
    'minecraft:basalt_pillar',
    'minecraft:birch_bees_0002',
    'minecraft:birch_bees_002',
    'minecraft:birch_bees_005',
    'minecraft:birch_other',
    'minecraft:birch_tall',
    'minecraft:birch',
    'minecraft:blackstone_blobs',
    'minecraft:blue_ice',
    'minecraft:bonus_chest',
    'minecraft:brown_mushroom_giant',
    'minecraft:brown_mushroom_nether',
    'minecraft:brown_mushroom_normal',
    'minecraft:brown_mushroom_swamp',
    'minecraft:brown_mushroom_taiga',
    'minecraft:chorus_plant',
    'minecraft:crimson_forest_vegetation',
    'minecraft:crimson_fungi_planted',
    'minecraft:crimson_fungi',
    'minecraft:dark_forest_vegetation_brown',
    'minecraft:dark_forest_vegetation_red',
    'minecraft:dark_oak',
    'minecraft:delta',
    'minecraft:desert_well',
    'minecraft:disk_clay',
    'minecraft:disk_gravel',
    'minecraft:disk_sand',
    'minecraft:end_gateway_delayed',
    'minecraft:end_gateway',
    'minecraft:end_island_decorated',
    'minecraft:end_island',
    'minecraft:end_spike',
    'minecraft:fancy_oak_bees_0002',
    'minecraft:fancy_oak_bees_002',
    'minecraft:fancy_oak_bees_005',
    'minecraft:fancy_oak',
    'minecraft:flower_default',
    'minecraft:flower_forest',
    'minecraft:flower_plain_decorated',
    'minecraft:flower_plain',
    'minecraft:flower_swamp',
    'minecraft:flower_warm',
    'minecraft:forest_flower_trees',
    'minecraft:forest_flower_vegetation_common',
    'minecraft:forest_flower_vegetation',
    'minecraft:forest_rock',
    'minecraft:fossil',
    'minecraft:freeze_top_layer',
    'minecraft:glowstone_extra',
    'minecraft:glowstone',
    'minecraft:huge_brown_mushroom',
    'minecraft:huge_red_mushroom',
    'minecraft:ice_patch',
    'minecraft:ice_spike',
    'minecraft:iceberg_blue',
    'minecraft:iceberg_packed',
    'minecraft:jungle_bush',
    'minecraft:jungle_tree_no_vine',
    'minecraft:jungle_tree',
    'minecraft:kelp_cold',
    'minecraft:kelp_warm',
    'minecraft:lake_lava',
    'minecraft:lake_water',
    'minecraft:large_basalt_columns',
    'minecraft:mega_jungle_tree',
    'minecraft:mega_pine',
    'minecraft:mega_spruce',
    'minecraft:monster_room',
    'minecraft:mushroom_field_vegetation',
    'minecraft:nether_sprouts',
    'minecraft:oak_badlands',
    'minecraft:oak_bees_0002',
    'minecraft:oak_bees_002',
    'minecraft:oak_bees_005',
    'minecraft:oak',
    'minecraft:ore_andesite',
    'minecraft:ore_blackstone',
    'minecraft:ore_coal',
    'minecraft:ore_debris_large',
    'minecraft:ore_debris_small',
    'minecraft:ore_diamond',
    'minecraft:ore_diorite',
    'minecraft:ore_dirt',
    'minecraft:ore_emerald',
    'minecraft:ore_gold_deltas',
    'minecraft:ore_gold_extra',
    'minecraft:ore_gold_nether',
    'minecraft:ore_gold',
    'minecraft:ore_granite',
    'minecraft:ore_gravel_nether',
    'minecraft:ore_gravel',
    'minecraft:ore_infested',
    'minecraft:ore_iron',
    'minecraft:ore_lapis',
    'minecraft:ore_magma',
    'minecraft:ore_quartz_deltas',
    'minecraft:ore_quartz_nether',
    'minecraft:ore_redstone',
    'minecraft:ore_soul_sand',
    'minecraft:patch_berry_bush',
    'minecraft:patch_berry_decorated',
    'minecraft:patch_berry_sparse',
    'minecraft:patch_brown_mushroom',
    'minecraft:patch_cactus_decorated',
    'minecraft:patch_cactus_desert',
    'minecraft:patch_cactus',
    'minecraft:patch_crimson_roots',
    'minecraft:patch_dead_bush_2',
    'minecraft:patch_dead_bush_badlands',
    'minecraft:patch_dead_bush',
    'minecraft:patch_fire',
    'minecraft:patch_grass_badlands',
    'minecraft:patch_grass_forest',
    'minecraft:patch_grass_jungle',
    'minecraft:patch_grass_normal',
    'minecraft:patch_grass_plain',
    'minecraft:patch_grass_savanna',
    'minecraft:patch_grass_taiga_2',
    'minecraft:patch_grass_taiga',
    'minecraft:patch_large_fern',
    'minecraft:patch_melon',
    'minecraft:patch_pumpkin',
    'minecraft:patch_red_mushroom',
    'minecraft:patch_soul_fire',
    'minecraft:patch_sugar_cane_badlands',
    'minecraft:patch_sugar_cane_desert',
    'minecraft:patch_sugar_cane_swamp',
    'minecraft:patch_sugar_cane',
    'minecraft:patch_sunflower',
    'minecraft:patch_taiga_grass',
    'minecraft:patch_tall_grass_2',
    'minecraft:patch_tall_grass',
    'minecraft:patch_waterlilly',
    'minecraft:pile_hay',
    'minecraft:pile_ice',
    'minecraft:pile_melon',
    'minecraft:pile_pumpkin',
    'minecraft:pile_snow',
    'minecraft:pine',
    'minecraft:plain_vegetation',
    'minecraft:red_mushroom_giant',
    'minecraft:red_mushroom_nether',
    'minecraft:red_mushroom_normal',
    'minecraft:red_mushroom_swamp',
    'minecraft:red_mushroom_taiga',
    'minecraft:sea_pickle',
    'minecraft:seagrass_cold',
    'minecraft:seagrass_deep_cold',
    'minecraft:seagrass_deep_warm',
    'minecraft:seagrass_deep',
    'minecraft:seagrass_normal',
    'minecraft:seagrass_river',
    'minecraft:seagrass_simple',
    'minecraft:seagrass_swamp',
    'minecraft:seagrass_warm',
    'minecraft:small_basalt_columns',
    'minecraft:spring_closed_double',
    'minecraft:spring_closed',
    'minecraft:spring_delta',
    'minecraft:spring_lava_double',
    'minecraft:spring_lava',
    'minecraft:spring_open',
    'minecraft:spring_water',
    'minecraft:spruce_snowy',
    'minecraft:spruce',
    'minecraft:super_birch_bees_0002',
    'minecraft:swamp_tree',
    'minecraft:taiga_vegetation',
    'minecraft:trees_birch',
    'minecraft:trees_giant_spruce',
    'minecraft:trees_giant',
    'minecraft:trees_jungle_edge',
    'minecraft:trees_jungle',
    'minecraft:trees_mountain_edge',
    'minecraft:trees_mountain',
    'minecraft:trees_savanna',
    'minecraft:trees_shattered_savanna',
    'minecraft:trees_water',
    'minecraft:twisting_vines',
    'minecraft:vines',
    'minecraft:void_start_platform',
    'minecraft:warm_ocean_vegetation',
    'minecraft:warped_forest_vegetation',
    'minecraft:warped_fungi_planted',
    'minecraft:warped_fungi',
    'minecraft:weeping_vines'
  ])

  collections.register('worldgen/configured_structure_feature', [
    'minecraft:bastion_remnant',
    'minecraft:buried_treasure',
    'minecraft:desert_pyramid',
    'minecraft:end_city',
    'minecraft:fortress',
    'minecraft:igloo',
    'minecraft:jungle_pyramid',
    'minecraft:mansion',
    'minecraft:mineshaft_mesa',
    'minecraft:mineshaft',
    'minecraft:monument',
    'minecraft:nether_fossil',
    'minecraft:ocean_ruin_cold',
    'minecraft:ocean_ruin_warm',
    'minecraft:pillager_outpost',
    'minecraft:ruined_portal_desert',
    'minecraft:ruined_portal_jungle',
    'minecraft:ruined_portal_mountain',
    'minecraft:ruined_portal_nether',
    'minecraft:ruined_portal_ocean',
    'minecraft:ruined_portal_swamp',
    'minecraft:ruined_portal',
    'minecraft:shipwreck_beached',
    'minecraft:shipwreck',
    'minecraft:stronghold',
    'minecraft:swamp_hut',
    'minecraft:village_desert',
    'minecraft:village_plains',
    'minecraft:village_savanna',
    'minecraft:village_snowy',
    'minecraft:village_taiga'
  ])

  collections.register('worldgen/configured_surface_builder', [
    'minecraft:badlands',
    'minecraft:basalt_deltas',
    'minecraft:crimson_forest',
    'minecraft:desert',
    'minecraft:end',
    'minecraft:eroded_badlands',
    'minecraft:frozen_ocean',
    'minecraft:full_sand',
    'minecraft:giant_tree_taiga',
    'minecraft:grass',
    'minecraft:gravelly_mountain',
    'minecraft:ice_spikes',
    'minecraft:mountain',
    'minecraft:mycelium',
    'minecraft:nether',
    'minecraft:nope',
    'minecraft:ocean_sand',
    'minecraft:shattered_savanna',
    'minecraft:soul_sand_valley',
    'minecraft:stone',
    'minecraft:swamp',
    'minecraft:warped_forest',
    'minecraft:wooded_badlands'
  ])

  collections.register('biome_category', [
    'beach',
    'desert',
    'extreme_hills',
    'forest',
    'icy',
    'jungle',
    'mesa',
    'mushroom',
    'nether',
    'none',
    'ocean',
    'plains',
    'river',
    'savanna',
    'swamp',
    'taiga',
    'the_end'
  ])

  collections.register('heightmap_type', [
    'MOTION_BLOCKING',
    'MOTION_BLOCKING_NO_LEAVES',
    'OCEAN_FLOOR',
    'OCEAN_FLOOR_WG',
    'WORLD_SURFACE',
    'WORLD_SURFACE_WG'
  ])

  collections.register('generation_step', [
    'air',
    'liquid'
  ])

  collections.register('loot_context_type', [
    'minecraft:empty',
    'minecraft:chest',
    'minecraft:command',
    'minecraft:selector',
    'minecraft:fishing',
    'minecraft:entity',
    'minecraft:gift',
    'minecraft:barter',
    'minecraft:advancement_reward',
    'minecraft:advancement_entity',
    'minecraft:generic',
    'minecraft:block'
  ])

  collections.register('banner_pattern', [
    'base',
    'square_bottom_left',
    'square_bottom_right',
    'square_top_left',
    'square_top_right',
    'stripe_bottom',
    'stripe_top',
    'stripe_left',
    'stripe_right',
    'stripe_center',
    'stripe_middle',
    'stripe_downright',
    'stripe_downleft',
    'small_stripes',
    'cross',
    'straight_cross',
    'triangle_bottom',
    'triangle_top',
    'triangles_bottom',
    'triangles_top',
    'diagonal_left',
    'diagonal_up_right',
    'diagonal_up_left',
    'diagonal_right',
    'circle',
    'rhombus',
    'half_vertical',
    'half_horizontal',
    'half_vertical_right',
    'half_horizontal_bottom',
    'border',
    'curly_border',
    'gradient',
    'gradient_up',
    'bricks',
    'globe',
    'creeper',
    'skull',
    'flower',
    'mojang',
    'piglin'
  ])

  collections.register('dye_color', [
    'white',
    'orange',
    'magenta',
    'light_blue',
    'yellow',
    'lime',
    'pink',
    'gray',
    'light_gray',
    'cyan',
    'purple',
    'blue',
    'brown',
    'green',
    'red',
    'black'
  ])
}
