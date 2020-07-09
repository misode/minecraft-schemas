import { SCHEMAS } from '@mcschema/core'
import './Collections'
import './schemas/Predicates'
import './schemas/Advancement'
import './schemas/Condition'
import './schemas/LootTable'
import './schemas/Dimension'
import './schemas/TextComponent'
import './schemas/worldgen/Biome'
import './schemas/worldgen/Feature'

export const schemas = {
  'advancement': SCHEMAS.get('advancement'),
  'biome': SCHEMAS.get('biome'),
  'predicate': SCHEMAS.get('predicate'),
  'dimension': SCHEMAS.get('dimension'),
  'dimension-type': SCHEMAS.get('dimension_type'),
  'feature': SCHEMAS.get('configured_feature'),
  'loot-table': SCHEMAS.get('loot_table'),
  'text-component': SCHEMAS.get('text_component_object')
}
