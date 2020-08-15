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
  Force,
} from '@mcschema/core'
import { ConditionCases } from './Common'

export function initConditionSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('predicate', ObjectOrList(
    Force(Reference('condition')), { choiceContext: 'condition' }
  ))

  schemas.register('condition', ObjectNode({
    condition: Resource(EnumNode('loot_condition_type', { defaultValue: 'minecraft:random_chance', validation: { validator: 'resource', params: { pool: 'minecraft:loot_condition_type' } } })),
    [Switch]: path => path.push('condition'),
    [Case]: ConditionCases
  }, { category: 'predicate', context: 'condition' }))
}
