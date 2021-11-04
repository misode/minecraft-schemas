import { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { initModelSchemas } from './Model'
import { initBlockDefinitionSchemas } from './BlockDefinition'

export function initAssetsSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
    initBlockDefinitionSchemas(schemas, collections)
    initModelSchemas(schemas, collections)
}
