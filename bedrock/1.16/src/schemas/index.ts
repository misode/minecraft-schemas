
import { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { initBlockSchemas } from './Block'
import { initItemSchemas } from './Item'

export function initSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
    initBlockSchemas(schemas, collections)
    initItemSchemas(schemas, collections)
}
