import {
  Case,
  ChoiceNode,
  EnumNode,
  Force,
  ListNode,
  MapNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference,
  Resource,
  SCHEMAS,
  StringNode,
  Switch,
} from '@mcschema/core'

SCHEMAS.register('recipe', Mod(ObjectNode({
  type: Force(Resource(EnumNode('recipe_serializer', { defaultValue: 'minecraft:crafting_shaped', validation: { validator: 'resource', params: { pool: 'minecraft:recipe_serializer' } } }))),
  [Switch]: path => path.push('type'),
  [Case]: {
    'minecraft:crafting_shaped': {
      group: StringNode(),
      pattern: Force(ListNode(StringNode({ pattern: /^.{0,3}$/, patternError: 'error.recipe.invalid_pattern' }))),
      key: Force(MapNode(
        StringNode({ pattern: /^.$/, patternError: 'error.recipe.invalid_key' }),
        Reference('recipe_ingredient')
      )),
      result: Force(Reference('recipe_result'))
    },
    'minecraft:crafting_shapeless': {
      group: StringNode(),
      ingredients: Force(ListNode(Reference('recipe_ingredient'))),
      result: Force(Reference('recipe_result'))
    },
    'minecraft:smelting': {
      group: StringNode(),
      ingredient: Force(Reference('recipe_ingredient')),
      result: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
      experience: NumberNode(),
      cookingtime: Mod(NumberNode({ integer: true }), { default: () => 200 })
    },
    'minecraft:blasting': {
      group: StringNode(),
      ingredient: Force(Reference('recipe_ingredient')),
      result: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
      experience: NumberNode(),
      cookingtime: Mod(NumberNode({ integer: true }), { default: () => 100 })
    },
    'minecraft:smoking': {
      group: StringNode(),
      ingredient: Force(Reference('recipe_ingredient')),
      result: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
      experience: NumberNode(),
      cookingtime: Mod(NumberNode({ integer: true }), { default: () => 100 })
    },
    'minecraft:campfire_cooking': {
      group: StringNode(),
      ingredient: Force(Reference('recipe_ingredient')),
      result: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
      experience: NumberNode(),
      cookingtime: Mod(NumberNode({ integer: true }), { default: () => 100 })
    },
    'minecraft:stonecutting': {
      group: StringNode(),
      ingredient: Force(Reference('recipe_ingredient')),
      result: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
      count: Force(NumberNode({ integer: true }))
    },
    'minecraft:smithing': {
      group: StringNode(),
      base: Force(Reference('recipe_ingredient_object')),
      addition: Force(Reference('recipe_ingredient_object')),
      result: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
    }
  }
}, { context: 'recipe' }), {
  default: () => ({
    type: 'minecraft:crafting_shaped'
  })
}))

SCHEMAS.register('recipe_ingredient', Mod(ChoiceNode([
  {
    type: 'object',
    node: Reference('recipe_ingredient_object'),
    change: v => v[0]
  },
  {
    type: 'list',
    node: ListNode(Reference('recipe_ingredient_object')),
    change: v => [v]
  }
]), {
  default: () => ({
    item: 'minecraft:stone'
  })
}))

SCHEMAS.register('recipe_ingredient_object', Mod(ObjectNode({
  item: Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } })),
  tag: Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$tag/item' } } }))
}), {
  default: () => ({
    item: 'minecraft:stone'
  })
}))

SCHEMAS.register('recipe_result', Mod(ObjectNode({
  item: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
  count: Mod(NumberNode({ integer: true }), { default: () => 1 })
}), {
  default: () => ({
    item: 'minecraft:stone'
  })
}))
