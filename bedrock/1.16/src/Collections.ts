import { CollectionRegistry } from '@mcschema/core'

export function initCollections(collections: CollectionRegistry) {

  collections.register('equipment_slot', [
    'slot.weapon.mainhand',
    'slot.weapon.offhand',
    'slot.armor.head',
    'slot.armor.chest',
    'slot.armor.legs',
    'slot.armor.feet',
    'slot.hotbar',
    'slot.inventory',
    'slot.enderchest',
    'slot.saddle',
    'slot.armor',
    'slot.chest'
  ])
}
