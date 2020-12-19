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
import { initWorldgenSchemas } from './worldgen'

export function initSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
    // `Common.ts` is the only file that has exports. It should be initialized first. 
    initCommonSchemas(schemas, collections)
    initAdvancementSchemas(schemas, collections)
    initConditionSchemas(schemas, collections)
    initLootTableSchemas(schemas, collections)
    initPackMcmetaSchemas(schemas, collections)
    initPredicatesSchemas(schemas, collections)
    initRecipeSchemas(schemas, collections)
    initTagsSchemas(schemas, collections)
    initTextComponentSchemas(schemas, collections)
    initWorldgenSchemas(schemas, collections)
}
