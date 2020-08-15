import {
  Case,
  ChoiceNode,
  EnumNode as RawEnumNode,
  Force,
  ListNode,
  MapNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Resource,
  StringNode,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
} from '@mcschema/core'

export function initRecipeSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const EnumNode = RawEnumNode.bind(undefined, collections)

  schemas.register('recipe', Mod(ObjectNode({
    type: Force(Resource(EnumNode('recipe_serializer', { defaultValue: 'minecraft:crafting_shaped', validation: { validator: 'resource', params: { pool: 'minecraft:recipe_serializer' } } }))),
    [Switch]: path => path.push('type'),
    [Case]: {
      'minecraft:crafting_shaped': {
        group: Opt(StringNode()),
        pattern: Force(ListNode(StringNode({ pattern: /^.{0,3}$/, patternError: 'error.recipe.invalid_pattern' }))),
        key: Force(MapNode(
          StringNode({ pattern: /^.$/, patternError: 'error.recipe.invalid_key' }),
          Reference('recipe_ingredient')
        )),
        result: Force(Reference('recipe_result'))
      },
      'minecraft:crafting_shapeless': {
        group: Opt(StringNode()),
        ingredients: Force(ListNode(Reference('recipe_ingredient'))),
        result: Force(Reference('recipe_result'))
      },
      'minecraft:smelting': {
        group: Opt(StringNode()),
        ingredient: Force(Reference('recipe_ingredient')),
        result: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
        experience: Opt(NumberNode()),
        cookingtime: Opt(Mod(NumberNode({ integer: true }), { default: () => 200 }))
      },
      'minecraft:blasting': {
        group: Opt(StringNode()),
        ingredient: Force(Reference('recipe_ingredient')),
        result: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
        experience: Opt(NumberNode()),
        cookingtime: Opt(Mod(NumberNode({ integer: true }), { default: () => 100 }))
      },
      'minecraft:smoking': {
        group: Opt(StringNode()),
        ingredient: Force(Reference('recipe_ingredient')),
        result: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
        experience: Opt(NumberNode()),
        cookingtime: Opt(Mod(NumberNode({ integer: true }), { default: () => 100 }))
      },
      'minecraft:campfire_cooking': {
        group: Opt(StringNode()),
        ingredient: Force(Reference('recipe_ingredient')),
        result: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
        experience: Opt(NumberNode()),
        cookingtime: Opt(Mod(NumberNode({ integer: true }), { default: () => 100 }))
      },
      'minecraft:stonecutting': {
        group: Opt(StringNode()),
        ingredient: Force(Reference('recipe_ingredient')),
        result: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
        count: Force(NumberNode({ integer: true }))
      },
      'minecraft:smithing': {
        group: Opt(StringNode()),
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

  schemas.register('recipe_ingredient', Mod(ChoiceNode([
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

  schemas.register('recipe_ingredient_object', Mod(ObjectNode({
    item: Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } })),
    tag: Resource(StringNode({ validation: { validator: 'resource', params: { pool: '$tag/item' } } }))
  }), {
    default: () => ({
      item: 'minecraft:stone'
    })
  }))

  schemas.register('recipe_result', Mod(ObjectNode({
    item: Force(Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } }))),
    count: Mod(NumberNode({ integer: true }), { default: () => 1 })
  }), {
    default: () => ({
      item: 'minecraft:stone'
    })
  }))
}
