import {
  EnumNode,
  Force,
  ListNode,
  MapNode,
  Mod,
  NumberNode,
  ObjectNode,
  Resource,
  SCHEMAS,
} from '@mcschema/core'

SCHEMAS.register('biome', Mod(ObjectNode({
  sky_color: NumberNode({ integer: true }),
  surface_builder: Force(Resource(EnumNode('worldgen/surface_builder', { search: true, additional: true }))),
  depth: NumberNode(),
  scale: NumberNode(),
  temperature: NumberNode(),
  downfall: NumberNode(),
  precipitation: EnumNode(['none', 'rain', 'snow'], 'none'),
  category: EnumNode('biome_category'),
  starts: Force(ListNode(
    EnumNode('configured_structure_feature', { search: true, additional: true })
  )),
  spawners: Force(MapNode(
    EnumNode([
      'water_ambient',
      'ambient',
      'misc',
      'water_creature',
      'creature',
      'monster'
    ], 'creature'),
    Mod(ListNode(
      ObjectNode({
        type: EnumNode('entity_type'),
        weight: NumberNode({ integer: true }),
        minCount: NumberNode({ integer: true }),
        maxCount: NumberNode({ integer: true })
      })
    ), {
      default: () => [{
        type: 'minecraft:bat',
        weight: 1
      }]
    })
  )),
  spawn_costs: Force(MapNode(
    EnumNode('entity_type', { search: true }),
    Mod(ObjectNode({
      energy_budget: Force(NumberNode()),
      charge: Force(NumberNode())
    }), {
      default: () => ({
        energy_budget: 0.12,
        charge: 1.0
      })
    })
  )),
  carvers: Force(MapNode(
    EnumNode(['air', 'liquid'], 'air'),
    Mod(ListNode(
      EnumNode('worldgen/carver', { search: true, additional: true})
    ), {
      default: () => ['minecraft:cave']
    })
  )),
  features: Force(ListNode(
    ListNode(
      EnumNode('configured_feature', { search: true, additional: true })
    )
  ))
}, { context: 'biome' }), {
  default: () => ({
    sky_color: 7907327,
    surface_builder: 'minecraft:default',
    depth: 0.1,
    scale: 0.2,
    temperature: 2.0,
    downfall: 0.0,
  })
}))

SCHEMAS.register('configured_surface_builder', ObjectNode({
  
}, { category: 'predicate' }))
