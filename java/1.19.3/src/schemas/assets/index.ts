import { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { initModelSchemas } from './Model'
import { initBlockDefinitionSchemas } from './BlockDefinition'
import { initFontSchemas } from './Font'

export function initAssetsSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
    initBlockDefinitionSchemas(schemas, collections)
    initFontSchemas(schemas, collections)
    initModelSchemas(schemas, collections)
}
