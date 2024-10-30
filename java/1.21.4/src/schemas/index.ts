import { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { initAdvancementSchemas } from './Advancement'
import { initAssetsSchemas } from './assets'
import { initBannerPatternSchemas } from './BannerPattern'
import { initChatTypeSchemas } from './ChatType'
import { initCommonSchemas } from './Common'
import { initConditionSchemas } from './Condition'
import { initDamageTypeSchemas } from './DamageType'
import { initDimensionSchemas } from './Dimension'
import { initDimensionTypeSchemas } from './DimensionType'
import { initItemModifierSchemas } from './ItemModifier'
import { initLootTableSchemas } from './LootTable'
import { initPackMcmetaSchemas } from './PackMcmeta'
import { initPredicatesSchemas } from './Predicates'
import { initRecipeSchemas } from './Recipe'
import { initTagsSchemas } from './Tags'
import { initTextComponentSchemas } from './TextComponent'
import { initTrialSpawnerSchemas } from './TrialSpawner'
import { initTrimsSchemas } from './Trims'
import { initWolfVariantSchemas } from './WolfVariant'
import { initWorldgenSchemas } from './worldgen'
import { initWorldSettingsSchemas } from './WorldSettings'
import { initComponentsSchemas } from './Components'
import { initPaintingVariantSchemas } from './PaintingVariant'
import { initEnchantmentSchemas } from './Enchantment'
import { initJukeboxSongSchemas } from './JukeboxSong'
import { initInstrumentSchemas } from './Instrument'

export function initSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
    // `Common.ts` is the only file that has exports. It should be initialized first. 
    initCommonSchemas(schemas, collections)
    initComponentsSchemas(schemas, collections)
    initChatTypeSchemas(schemas, collections)
    initAdvancementSchemas(schemas, collections)
    initAssetsSchemas(schemas, collections)
    initBannerPatternSchemas(schemas, collections)
    initConditionSchemas(schemas, collections)
    initDamageTypeSchemas(schemas, collections)
    initDimensionTypeSchemas(schemas, collections)
    initDimensionSchemas(schemas, collections)
    initEnchantmentSchemas(schemas, collections)
    initInstrumentSchemas(schemas, collections)
    initItemModifierSchemas(schemas, collections)
    initJukeboxSongSchemas(schemas, collections)
    initLootTableSchemas(schemas, collections)
    initPackMcmetaSchemas(schemas, collections)
    initPaintingVariantSchemas(schemas, collections)
    initPredicatesSchemas(schemas, collections)
    initRecipeSchemas(schemas, collections)
    initTagsSchemas(schemas, collections)
    initTextComponentSchemas(schemas, collections)
    initTrialSpawnerSchemas(schemas, collections)
    initTrimsSchemas(schemas, collections)
    initWolfVariantSchemas(schemas, collections)
    initWorldgenSchemas(schemas, collections)
    initWorldSettingsSchemas(schemas, collections)
}
