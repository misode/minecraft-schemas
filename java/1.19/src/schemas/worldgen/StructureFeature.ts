import {
  BooleanNode,
  Case,
  StringNode as RawStringNode,
  Reference as RawReference,
  Mod,
  NodeChildren,
  NumberNode,
  ObjectNode,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
  MapNode,
} from '@mcschema/core'
import { Tag } from '../Common'
import { MobCategorySpawnSettings } from './Biome'

export function initStructureFeatureSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)
  const Reference = RawReference.bind(undefined, schemas)

  const templatePoolConfig: NodeChildren = {
    start_pool: StringNode({ validator: 'resource', params: { pool: '$worldgen/template_pool'}}),
    size: NumberNode({ integer: true })
  }

  schemas.register('configured_structure_feature', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/structure_feature'}}),
    biomes: Tag({ resource: '$worldgen/biome' }),
    adapt_noise: Opt(BooleanNode()),
    spawn_overrides: MapNode(
      StringNode({ enum: 'mob_category' }),
      ObjectNode({
        bounding_box: StringNode({ enum: ['piece', 'full'] }),
        spawns: MobCategorySpawnSettings,
      })
    ),
    config: ObjectNode({
      [Switch]: ['pop', { push: 'type' }],
      [Case]: {
        'minecraft:bastion_remnant': templatePoolConfig,
        'minecraft:buried_treasure': {
          probability: NumberNode({ min: 0, max: 1 })
        },
        'minecraft:mineshaft': {
          type: StringNode({ enum: ['normal', 'mesa'] }),
          probability: NumberNode({ min: 0, max: 1 })
        },
        'minecraft:nether_fossil': {
          height: Reference('height_provider')
        },
        'minecraft:ocean_ruin': {
          biome_temp: StringNode({ enum: ['cold', 'warm'] }),
          large_probability: NumberNode({ min: 0, max: 1 }),
          cluster_probability: NumberNode({ min: 0, max: 1 })
        },
        'minecraft:pillager_outpost': templatePoolConfig,
        'minecraft:ruined_portal': {
          portal_type: StringNode({ enum: ['standard', 'desert', 'jungle', 'mountain', 'nether', 'ocean', 'swamp'] })
        },
        'minecraft:shipwreck': {
          is_beached: Opt(BooleanNode())
        },
        'minecraft:village': templatePoolConfig
      }
    }, { context: 'structure_feature', disableSwitchContext: true })
  }, { context: 'structure_feature' }), {
    default: () => ({
      type: 'minecraft:bastion_remnant',
      config: {
        start_pool: 'minecraft:bastion/starts',
        size: 6
      }
    })
  }))
}
