import { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { initAdvancementSchemas } from './Advancement'
import { initCommonSchemas } from './Common'
import { initConditionSchemas } from './Condition'
import { initLootTableSchemas } from './LootTable'
import { initPackMcmetaSchemas } from './PackMcmeta'
import { initPredicatesSchemas } from './Predicates'
import { initRecipeSchemas } from './Recipe'
import { initTagsSchemas } from './Tags'
import { initTextComponentSchemas } from './TextComponent'

export function initSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
    // `Common.ts` and `Predicates.ts` are files that have exports. They should be initialized first. 
    initCommonSchemas(schemas, collections)
    initPredicatesSchemas(schemas, collections)
    initAdvancementSchemas(schemas, collections)
    initConditionSchemas(schemas, collections)
    initLootTableSchemas(schemas, collections)
    initPackMcmetaSchemas(schemas, collections)
    initRecipeSchemas(schemas, collections)
    initTagsSchemas(schemas, collections)
    initTextComponentSchemas(schemas, collections)
}
