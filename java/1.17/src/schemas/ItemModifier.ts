import {
  Case,
  StringNode as RawStringNode,
  ObjectNode,
  ObjectOrList,
  Reference as RawReference,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Mod,
  ListNode,
  Opt,
  NodeChildren,
} from '@mcschema/core'
import { FunctionCases } from './Common'

export function initItemModifierSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('item_modifier', ObjectOrList(
    Reference('function'), { choiceContext: 'function' }
  ))

  const conditions: NodeChildren = {
    conditions: Opt(ListNode(
      Reference('condition')
    ))
  }

  schemas.register('function', Mod(ObjectNode({
    function: StringNode({ validator: 'resource', params: { pool: 'loot_function_type' } }),
    [Switch]: [{ push: 'function' }],
    [Case]: FunctionCases(conditions)
  }, { category: 'function', context: 'function' }), {
    default: () => [{
      function: 'minecraft:set_count',
      count: 1
    }]
  }))
}
