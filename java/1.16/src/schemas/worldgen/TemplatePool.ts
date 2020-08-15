import {
  Case,
  ChoiceNode,
  EnumNode as RawEnumNode,
  Force,
  ListNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  StringNode,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
} from '@mcschema/core'
import './ProcessorList'

export function initTemplatePoolSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const EnumNode = RawEnumNode.bind(undefined, collections)

  const Projection = EnumNode(['rigid', 'terrain_matching'], 'rigid')
  const Processors = ChoiceNode([
    {
      type: 'string',
      node: StringNode(),
      change: v => undefined
    },
    {
      type: 'object',
      node: Reference('processor_list'),
      change: v => ({
        processors: [{}]
      })
    }
  ])

  schemas.register('template_pool', Mod(ObjectNode({
    name: StringNode(),
    fallback: StringNode(),
    elements: ListNode(
      Reference('template_weighted_element')
    )
  }, { context: 'template_pool' }), {
    default: () => ({
      fallback: 'minecraft:empty',
      elements: [
        {
          weight: 1,
          element: {
            element_type: 'minecraft:list_pool_element'
          }
        }
      ]
    })
  }))

  schemas.register('template_weighted_element', Mod(ObjectNode({
    weight: NumberNode({ integer: true, min: 1 }),
    element: Reference('template_element')
  }), {
    default: () => ({
      weight: 1,
      element: {
        element_type: 'minecraft:single_pool_element'
      }
    })
  }))

  schemas.register('template_element', ObjectNode({
    element_type: EnumNode('worldgen/structure_pool_element', 'minecraft:single_pool_element'),
    projection: Projection,
    [Switch]: path => path.push('element_type'),
    [Case]: {
      'minecraft:feature_pool_element': {
        feature: EnumNode('configured_feature', { search: true, additional: true }),
        processors: Processors
      },
      'minecraft:legacy_single_pool_element': {
        location: StringNode(),
        processors: Processors
      },
      'minecraft:list_pool_element': {
        elements: ListNode(
          Reference('template_element')
        )
      },
      'minecraft:single_pool_element': {
        location: StringNode(),
        processors: Processors
      }
    }
  }, { context: 'template_element', disableSwitchContext: true }))
}
