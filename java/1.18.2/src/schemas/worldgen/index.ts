import { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { initBiomeSchemas } from './Biome'
import { initCarverSchemas } from './Carver'
import { initDecoratorSchemas } from './Decorator'
import { initDensityFunctionSchemas } from './DensityFunction'
import { initFeatureSchemas } from './Feature'
import { initNoiseSettingsSchemas } from './NoiseSettings'
import { initProcessorListSchemas } from './ProcessorList'
import { initStructureFeatureSchemas } from './StructureFeature'
import { initStructureSetSchemas } from './StructureSet'
import { initSurfaceRuleSchemas } from './SurfaceRule'
import { initTemplatePoolSchemas } from './TemplatePool'

export function initWorldgenSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
    // `ProcessorList.ts`, `DensityFunction.ts`, and `Biome.ts` have exports. They should be initialized first. 
    initProcessorListSchemas(schemas, collections)
    initDensityFunctionSchemas(schemas, collections)
    initBiomeSchemas(schemas, collections)
    initCarverSchemas(schemas, collections)
    initDecoratorSchemas(schemas, collections)
    initFeatureSchemas(schemas, collections)
    initNoiseSettingsSchemas(schemas, collections)
    initStructureFeatureSchemas(schemas, collections)
    initStructureSetSchemas(schemas, collections)
    initSurfaceRuleSchemas(schemas, collections)
    initTemplatePoolSchemas(schemas, collections)
}
