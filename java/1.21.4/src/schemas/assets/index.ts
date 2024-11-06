import { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { initModelSchemas } from './Model'
import { initBlockDefinitionSchemas } from './BlockDefinition'
import { initFontSchemas } from './Font'
import { initAtlasSchemas } from './Atlas'
import { initItemModelSchemas } from './ItemModel'

export function initAssetsSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
    initAtlasSchemas(schemas, collections)
    initBlockDefinitionSchemas(schemas, collections)
    initItemModelSchemas(schemas, collections)
    initFontSchemas(schemas, collections)
    initModelSchemas(schemas, collections)
}
