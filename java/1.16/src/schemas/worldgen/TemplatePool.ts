import {
  EnumNode,
  Force,
  Mod,
  ObjectNode,
  Resource,
  SCHEMAS,
  ListNode,
  Reference,
  Switch,
  Case,
  NumberNode,
  StringNode,
  ChoiceNode,
} from '@mcschema/core'
import './ProcessorList'

const Projection = EnumNode(['rigid', 'terrain_matching'], 'rigid')
const Processors = ChoiceNode([
  [
    'string',
    StringNode(),
    v => undefined
  ],
  [
    'object',
    Reference('processor_list'),
    v => ({
      processors: [{}]
    })
  ]
])

SCHEMAS.register('template_pool', Mod(ObjectNode({
  name: StringNode(),
  fallback: StringNode(),
  elements: ListNode(
    Reference('template_weighted_element')
  )
}, { context: 'template_pool' }), {
  default: () => ({
    fallback: 'minecraft:empty',
    
  })
}))

SCHEMAS.register('template_weighted_element', Mod(ObjectNode({
  weight: NumberNode({ integer: true, min: 1 }),
  element: Force(Reference('template_element'))
}), {
  default: () => ({
    weight: 1,
    element: {
      element_type: 'minecraft:single_pool_element'
    }
  })
}))

SCHEMAS.register('template_element', ObjectNode({
  element_type: Force(EnumNode('worldgen/structure_pool_element', 'minecraft:single_pool_element')),
  [Switch]: path => path.push('element_type'),
  [Case]: {
    'minecraft:feature_pool_element': {
      feature: EnumNode('configured_feature', { search: true, additional: true }),
      projection: Force(Projection),
      processors: Force(Processors)
    },
    'minecraft:legacy_single_pool_element': {
      location: StringNode(),
      projection: Force(Projection),
      processors: Force(Processors)
    },
    'minecraft:list_pool_element': {
      projection: Force(Projection),
      elements: ListNode(
        Reference('template_element')
      )
    },
    'minecraft:single_pool_element': {
      location: StringNode(),
      projection: Force(Projection),
      processors: Force(Processors)
    }
  }
}))
