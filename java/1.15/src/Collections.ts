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
}
