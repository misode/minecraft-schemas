import './Collections'
import './schemas/Predicates'
import { AdvancementSchema } from './schemas/Advancement'
import { ConditionSchema } from './schemas/Condition'
import { LootTableSchema } from './schemas/LootTable'
import { DimensionSchema, DimensionTypeSchema } from './schemas/Dimension'
import { TextComponentSchema } from './schemas/TextComponent'

export const schemas = {
  'advancement': AdvancementSchema,
  'predicate': ConditionSchema,
  'dimension': DimensionSchema,
  'dimension-type': DimensionTypeSchema,
  'loot-table': LootTableSchema,
  'text-component': TextComponentSchema
}
