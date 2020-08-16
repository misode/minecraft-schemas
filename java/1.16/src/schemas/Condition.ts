import {
  Case,
  EnumNode as RawEnumNode,
  ObjectNode,
  ObjectOrList,
  Reference as RawReference,
  Resource,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Mod,
} from '@mcschema/core'
import { ConditionCases } from './Common'

export function initConditionSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('predicate', Mod(ObjectOrList(
    Reference('condition'), { choiceContext: 'condition' }
  ), {
    default: () => ({
      condition: 'minecraft:entity_properties',
      predicate: {}
    })
  }))

  schemas.register('condition', ObjectNode({
    condition: Resource(EnumNode('loot_condition_type', { defaultValue: 'minecraft:random_chance', validation: { validator: 'resource', params: { pool: 'minecraft:loot_condition_type' } } })),
    [Switch]: path => path.push('condition'),
    [Case]: ConditionCases
  }, { category: 'predicate', context: 'condition' }))
}
