import {
  Case,
  EnumNode,
  Force,
  Mod,
  NumberNode,
  ObjectNode,
  Reference,
  Resource,
  SCHEMAS,
  Switch,
} from '@mcschema/core'

SCHEMAS.register('configured_feature', Mod(ObjectNode({
  name: Force(Resource(EnumNode('worldgen/feature', 'minecraft:tree'))),
  config: Force(ObjectNode({
    [Switch]: path => path.pop().push('name'),
    [Case]: {
      'minecraft:decorated': {
        decorator: Force(Reference('configured_decorator')),
        feature: Force(Reference('configured_feature'))
      }
    }
  }))
}), {
  default: () => ({
    name: 'minecraft:decorated',
    config: {
      decorator: {
        name: 'minecraft:count',
        config: {
          count: 4
        }
      },
      feature: {
        name: 'minecraft:tree'
      }
    }
  })
}))

SCHEMAS.register('configured_decorator', ObjectNode({
  name: Force(Resource(EnumNode('worldgen/decorator', 'minecraft:count'))),
  config: ObjectNode({
    [Switch]: path => path.pop().push('name'),
    [Case]: {
      'minecraft:decorated': {
        outer: Force(Reference('configured_decorator')),
        inner: Force(Reference('configured_decorator'))
      },
      'minecraft:chance': {
        chance: NumberNode({ integer: true })
      },
      'minecraft:count': {
        count: NumberNode({ integer: true })
      }
    }
  }, { category: 'predicate' })
}, { category: 'predicate' }))
