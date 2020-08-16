import {
  Case,
  ChoiceNode,
  EnumNode as RawEnumNode,
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
    type: Resource(EnumNode('recipe_serializer', { defaultValue: 'minecraft:crafting_shaped', validation: { validator: 'resource', params: { pool: 'minecraft:recipe_serializer' } } })),
    [Switch]: path => path.push('type'),
    [Case]: {
      'minecraft:crafting_shaped': {
        group: Opt(StringNode()),
        pattern: ListNode(StringNode({ pattern: /^.{0,3}$/, patternError: 'error.recipe.invalid_pattern' })),
        key: MapNode(
          StringNode({ pattern: /^.$/, patternError: 'error.recipe.invalid_key' }),
          Reference('recipe_ingredient')
        ),
        result: Reference('recipe_result')
      },
      'minecraft:crafting_shapeless': {
        group: Opt(StringNode()),
        ingredients: ListNode(Reference('recipe_ingredient')),
        result: Reference('recipe_result')
      },
      'minecraft:smelting': {
        group: Opt(StringNode()),
        ingredient: Reference('recipe_ingredient'),
        result: Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } })),
        experience: Opt(NumberNode()),
        cookingtime: Opt(Mod(NumberNode({ integer: true }), { default: () => 200 }))
      },
      'minecraft:blasting': {
        group: Opt(StringNode()),
        ingredient: Reference('recipe_ingredient'),
        result: Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } })),
        experience: Opt(NumberNode()),
        cookingtime: Opt(Mod(NumberNode({ integer: true }), { default: () => 100 }))
      },
      'minecraft:smoking': {
        group: Opt(StringNode()),
        ingredient: Reference('recipe_ingredient'),
        result: Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } })),
        experience: Opt(NumberNode()),
        cookingtime: Opt(Mod(NumberNode({ integer: true }), { default: () => 100 }))
      },
      'minecraft:campfire_cooking': {
        group: Opt(StringNode()),
        ingredient: Reference('recipe_ingredient'),
        result: Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } })),
        experience: Opt(NumberNode()),
        cookingtime: Opt(Mod(NumberNode({ integer: true }), { default: () => 100 }))
      },
      'minecraft:stonecutting': {
        group: Opt(StringNode()),
        ingredient: Reference('recipe_ingredient'),
        result: Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } })),
        count: NumberNode({ integer: true })
      },
      'minecraft:smithing': {
        group: Opt(StringNode()),
        base: Reference('recipe_ingredient_object'),
        addition: Reference('recipe_ingredient_object'),
        result: Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } })),
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
    item: Resource(EnumNode('item', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:item' } } })),
    count: Mod(NumberNode({ integer: true }), { default: () => 1 })
  }), {
    default: () => ({
      item: 'minecraft:stone'
    })
  }))
}
