import {
  BooleanNode,
  Case,
  EnumNode as RawEnumNode,
  Mod,
  NodeChildren,
  NumberNode,
  ObjectNode,
  Resource,
  StringNode,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
} from '@mcschema/core'

export function initStructureFeatureSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const EnumNode = RawEnumNode.bind(undefined, collections)

  const templatePoolConfig: NodeChildren = {
    start_pool: StringNode(),
    size: NumberNode({ integer: true })
  }

  schemas.register('configured_structure_feature', Mod(ObjectNode({
    type: Resource(EnumNode('worldgen/structure_feature')),
    config: ObjectNode({
      [Switch]: path => path.pop().push('type'),
      [Case]: {
        'minecraft:bastion_remnant': templatePoolConfig,
        'minecraft:buried_treasure': {
          probability: NumberNode({ min: 0, max: 1 })
        },
        'minecraft:mineshaft': {
          type: EnumNode(['normal', 'mesa'], 'normal'),
          probability: NumberNode({ min: 0, max: 1 })
        },
        'minecraft:ocean_ruin': {
          biome_temp: EnumNode(['cold', 'warm'], 'cold'),
          large_probability: NumberNode({ min: 0, max: 1 }),
          cluster_probability: NumberNode({ min: 0, max: 1 })
        },
        'minecraft:pillager_outpost': templatePoolConfig,
        'minecraft:ruined_portal': {
          portal_type: EnumNode(['standard', 'desert', 'jungle',
            'mountain', 'nether', 'ocean', 'swamp'], 'standard')
        },
        'minecraft:shipwreck': {
          is_beached: BooleanNode()
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
