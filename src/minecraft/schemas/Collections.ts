import { COLLECTIONS } from '../../Registries'

COLLECTIONS.register('advancement_trigger', [
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
  'minecraft:player_killed_entity',
  'minecraft:recipe_unlocked',
  'minecraft:shot_crossbow',
  'minecraft:slept_in_bed',
  'minecraft:slide_down_block',
  'minecraft:summoned_entity',
  'minecraft:tame_animal',
  'minecraft:tick',
  'minecraft:thrown_item_picked_up_by_entity',
  'minecraft:used_ender_eye',
  'minecraft:used_totem',
  'minecraft:villager_trade',
  'minecraft:voluntary_exile'
])

COLLECTIONS.register('dimension', [
  'overworld',
  'the_nether',
  'the_end'
])

COLLECTIONS.register('slot', [
  'mainhand',
  'offhand',
  'head',
  'chest',
  'legs',
  'feet'
])

COLLECTIONS.register('gamemode', [
  'survival',
  'creative',
  'adventure',
  'spectator'
])

COLLECTIONS.register('entity_source', [
  'this',
  'killer',
  'killer_player'
])

COLLECTIONS.register('copy_source', [
  'block_entity',
  'this',
  'killer',
  'killer_player'
])

COLLECTIONS.register('map_decoration', [
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
