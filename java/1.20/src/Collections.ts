import { CollectionRegistry } from '@mcschema/core'

export function initCollections(collections: CollectionRegistry) {
  collections.register('advancement_trigger', [
    'minecraft:allay_drop_item_on_block',
    'minecraft:avoid_vibration',
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
    'minecraft:fall_from_height',
    'minecraft:filled_bucket',
    'minecraft:fishing_rod_hooked',
    'minecraft:hero_of_the_village',
    'minecraft:impossible',
    'minecraft:inventory_changed',
    'minecraft:item_durability_changed',
    'minecraft:item_used_on_block',
    'minecraft:kill_mob_near_sculk_catalyst',
    'minecraft:killed_by_crossbow',
    'minecraft:levitation',
    'minecraft:lightning_strike',
    'minecraft:location',
    'minecraft:nether_travel',
    'minecraft:placed_block',
    'minecraft:player_generates_container_loot',
    'minecraft:player_hurt_entity',
    'minecraft:player_interacted_with_entity',
    'minecraft:player_killed_entity',
    'minecraft:recipe_crafted',
    'minecraft:recipe_unlocked',
    'minecraft:ride_entity_in_lava',
    'minecraft:shot_crossbow',
    'minecraft:slept_in_bed',
    'minecraft:slide_down_block',
    'minecraft:started_riding',
    'minecraft:summoned_entity',
    'minecraft:tame_animal',
    'minecraft:target_hit',
    'minecraft:tick',
    'minecraft:thrown_item_picked_up_by_entity',
    'minecraft:thrown_item_picked_up_by_player',
    'minecraft:used_ender_eye',
    'minecraft:used_totem',
    'minecraft:using_item',
    'minecraft:villager_trade',
    'minecraft:voluntary_exile'
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

  collections.register('entity_source', [
    'this',
    'killer',
    'direct_killer',
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

  collections.register('map_feature', [
    'bastion_remnant',
    'buried_treasure',
    'desert_pyramid',
    'endcity',
    'fortress',
    'igloo',
    'jungle_pyramid',
    'mansion',
    'mineshaft',
    'monument',
    'nether_fossil',
    'ocean_ruin',
    'pillager_outpost',
    'ruined_portal',
    'shipwreck',
    'stronghold',
    'swamp_hut',
    'village'
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

  collections.register('biome_category', [
    'beach',
    'desert',
    'extreme_hills',
    'forest',
    'icy',
    'jungle',
    'mesa',
    'mountain',
    'mushroom',
    'nether',
    'none',
    'ocean',
    'plains',
    'river',
    'savanna',
    'swamp',
    'taiga',
    'the_end',
    'underground'
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

  collections.register('decoration_step', [
    'raw_generation',
    'lakes',
    'local_modifications',
    'underground_structures',
    'surface_structures',
    'strongholds',
    'underground_ores',
    'underground_decoration',
    'fluid_springs',
    'vegetal_decoration',
    'top_layer_modification'
  ])

  collections.register('loot_context_type', [
    'minecraft:empty',
    'minecraft:chest',
    'minecraft:command',
    'minecraft:selector',
    'minecraft:fishing',
    'minecraft:entity',
    'minecraft:archaeology',
    'minecraft:gift',
    'minecraft:barter',
    'minecraft:advancement_reward',
    'minecraft:advancement_entity',
    'minecraft:advancement_location',
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

  collections.register('cave_surface', [
    'floor',
    'ceiling'
  ])

  collections.register('direction', [
    'down',
    'up',
    'north',
    'east',
    'south',
    'west'
  ])

  collections.register('axis', [
    'x',
    'y',
    'z'
  ])

  collections.register('display_position', [
    'firstperson_righthand',
    'firstperson_lefthand',
    'thirdperson_righthand',
    'thirdperson_lefthand',
    'gui',
    'head',
    'ground',
    'fixed'
  ])

  collections.register('gui_light', [
    'front',
    'side'
  ])

  collections.register('item_model_predicates', [
    'angle',
    'blocking',
    'broken',
    'cast',
    'charged',
    'cooldown',
    'custom_model_data',
    'damage',
    'damaged',
    'firework',
    'lefthanded',
    'pull',
    'pulling',
    'throwing',
    'time'
  ])

  collections.register('glyph_provider_type', [
    'bitmap',
    'reference',
    'ttf',
    'space',
    'unihex',
  ])

  collections.register('mob_category', [
    'monster',
    'creature',
    'ambient',
    'axolotls',
    'underground_water_creature',
    'water_creature',
    'water_ambient',
    'misc',
  ])

  collections.register('feature_flags', [
    'vanilla',
    'bundle',
  ])

  collections.register('sprite_source_type', [
    'single',
    'directory',
    'filter',
    'unstitch',
    'paletted_permutations',
  ])

  collections.register('type_specific_type', [
    'any',
    'axolotl',
    'boat',
    'cat',
    'fishing_hook',
    'fox',
    'frog',
    'horse',
    'lightning',
    'llama',
    'mooshroom',
    'painting',
    'parrot',
    'player',
    'rabbit',
    'slime',
    'tropical_fish',
    'villager',
  ])

  collections.register('axolotl_variant', [
    'lucy',
    'wild',
    'gold',
    'cyan',
    'blue',
  ])

  collections.register('boat_variant', [
    'oak',
    'spruce',
    'birch',
    'jungle',
    'acacia',
    'dark_oak',
    'mangrove',
    'bamboo',
  ])

  collections.register('fox_variant', [
    'red',
    'snow',
  ])

  collections.register('horse_variant', [
    'white',
    'creamy',
    'chestnut',
    'brown',
    'black',
    'gray',
    'dark_brown',
  ])

  collections.register('llama_variant', [
    'creamy',
    'white',
    'brown',
    'gray',
  ])

  collections.register('mooshroom_variant', [
    'red',
    'brown',
  ])

  collections.register('parrot_variant', [
    'red_blue',
    'blue',
    'green',
    'yellow_blue',
    'gray',
  ])

  collections.register('rabbit_variant', [
    'brown',
    'white',
    'black',
    'white_splotched',
    'gold',
    'salt',
    'evil',
  ])

  collections.register('tropical_fish_variant', [
    'kob',
    'sunstreak',
    'snooper',
    'dasher',
    'brinely',
    'spotty',
    'flopper',
    'stripey',
    'glitter',
    'blockfish',
    'betty',
    'clayfish',
  ])

  collections.register('armor_material', [
    'leather',
    'chainmail',
    'iron',
    'gold',
    'diamond',
    'turtle',
    'netherite',
  ])

  collections.register('damage_scaling', [
    'never',
    'always',
    'when_caused_by_living_non_player',
  ])

  collections.register('damage_effects', [
    'hurt',
    'thorns',
    'drowning',
    'burning',
    'poking',
    'freezing',
  ])

  collections.register('death_message_type', [
    'default',
    'fall_variants',
    'intentional_game_design',
  ])

  collections.register('recipe_category', [
    'blocks',
    'building',
    'equipment',
    'food',
    'misc',
    'redstone',
  ])
}
