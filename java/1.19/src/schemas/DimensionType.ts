import {
  BooleanNode,
  StringNode as RawStringNode,
  Mod,
  NumberNode,
  ObjectNode,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'
import { IntProvider } from './Common'

export function initDimensionTypeSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('dimension_type', Mod(ObjectNode({
    ultrawarm: BooleanNode(),
    natural: BooleanNode(),
    piglin_safe: BooleanNode(),
    respawn_anchor_works: BooleanNode(),
    bed_works: BooleanNode(),
    has_raids: BooleanNode(),
    has_skylight: BooleanNode(),
    has_ceiling: BooleanNode(),
    coordinate_scale: NumberNode({ min: 0.00001, max: 30000000 }),
    ambient_light: NumberNode(),
    fixed_time: Opt(NumberNode({ integer: true })),
    logical_height: NumberNode({ integer: true, min: 0, max: 4064 }),
    effects: Opt(StringNode({ validator: 'resource', params: { pool: ['minecraft:overworld', 'minecraft:the_nether', 'minecraft:the_end'] } })),
    infiniburn: StringNode({ validator: 'resource', params: { pool: 'block', requireTag: true } }),
    min_y: NumberNode({ integer: true, min: -2032, max: 2031 }),
    height: NumberNode({ integer: true, min: 16, max: 4064 }),
    monster_spawn_light_level: IntProvider({ min: 0, max: 15 }),
    monster_spawn_block_light_limit: NumberNode({ integer: true, min: 0, max: 15 }),
  }, { context: 'dimension_type' }), node => ({
    default: () => ({
      ultrawarm: false,
      natural: true,
      piglin_safe: false,
      respawn_anchor_works: false,
      bed_works: true,
      has_raids: true,
      has_skylight: true,
      has_ceiling: false,
      coordinate_scale: 1,
      ambient_light: 0,
      logical_height: 384,
      effects: 'minecraft:overworld',
      infiniburn: '#minecraft:infiniburn_overworld',
      min_y: -64,
      height: 384,
      monster_spawn_block_light_limit: 0,
      monster_spawn_light_level: {
        type: 'minecraft:uniform',
        value: {
          min_inclusive: 0,
          max_inclusive: 7,
        },
      },
    }),
    validate: (path, value, errors, options) => {
      value = node.validate(path, value, errors, options)
      if (value?.min_y + value?.height > 2032) {
        errors.add(path.push('height'), 'error.min_y_plus_height', 2032)
      }
      if (value?.logical_height > value?.height) {
        errors.add(path.push('logical_height'), 'error.logical_height')
      }
      if (value?.height % 16 !== 0) {
        errors.add(path.push('height'), 'error.height_multiple', 16)
      }
      if (value?.min_y % 16 !== 0) {
        errors.add(path.push('min_y'), 'error.min_y_multiple', 16)
      }
      return value
    }
  })))
}
