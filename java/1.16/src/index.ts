import { CollectionRegistry, SchemaRegistry, VERSIONS } from '@mcschema/core'
import { initCollections } from './Collections'
import { initSchemas } from './schemas'

export * as lootContext from './LootContext'

const collections = new CollectionRegistry()
const schemas = new SchemaRegistry()
const version = { collections, schemas }
initCollections(collections)
initSchemas(schemas, collections)

VERSIONS.register('java-1.16', version)
