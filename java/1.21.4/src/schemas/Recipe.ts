import {
  Case,
  ChoiceNode,
  StringNode as RawStringNode,
  ListNode,
  MapNode,
  Mod,
  NumberNode,
  ObjectNode,
  Reference as RawReference,
  Switch,
  SchemaRegistry,
  CollectionRegistry,
  Opt,
  BooleanNode,
} from '@mcschema/core'
import { Tag } from './Common'

export function initRecipeSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const Reference = RawReference.bind(undefined, schemas)
  const StringNode = RawStringNode.bind(undefined, collections)

  schemas.register('recipe', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'recipe_serializer' } }),
    category: Opt(StringNode({ enum: 'recipe_category' })),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:crafting_shaped': {
        group: Opt(StringNode({ enum: 'recipe_group', additional: true })),
        pattern: ListNode(StringNode()), // TODO: add validation
        key: MapNode(
          StringNode(), // TODO: add validation
          Reference('recipe_ingredient')
        ),
        result: Reference('item_stack'),
        show_notification: Opt(BooleanNode()),
      },
      'minecraft:crafting_shapeless': {
        group: Opt(StringNode()),
        ingredients: ListNode(Reference('recipe_ingredient')),
        result: Reference('item_stack')
      },
      'minecraft:crafting_transmute': {
        group: Opt(StringNode()),
        input: Reference('recipe_ingredient'),
        material: Reference('recipe_ingredient'),
        result: StringNode({ validator: 'resource', params: { pool: 'item' } })
      },
      'minecraft:smelting': {
        group: Opt(StringNode()),
        ingredient: Reference('recipe_ingredient'),
        result: Reference('single_item_stack'),
        experience: Opt(NumberNode()),
        cookingtime: Opt(Mod(NumberNode({ integer: true }), { default: () => 200 }))
      },
      'minecraft:blasting': {
        group: Opt(StringNode()),
        ingredient: Reference('recipe_ingredient'),
        result: Reference('single_item_stack'),
        experience: Opt(NumberNode()),
        cookingtime: Opt(Mod(NumberNode({ integer: true }), { default: () => 100 }))
      },
      'minecraft:smoking': {
        group: Opt(StringNode()),
        ingredient: Reference('recipe_ingredient'),
        result: Reference('single_item_stack'),
        experience: Opt(NumberNode()),
        cookingtime: Opt(Mod(NumberNode({ integer: true }), { default: () => 100 }))
      },
      'minecraft:campfire_cooking': {
        group: Opt(StringNode()),
        ingredient: Reference('recipe_ingredient'),
        result: Reference('single_item_stack'),
        experience: Opt(NumberNode()),
        cookingtime: Opt(Mod(NumberNode({ integer: true }), { default: () => 100 }))
      },
      'minecraft:stonecutting': {
        group: Opt(StringNode()),
        ingredient: Reference('recipe_ingredient'),
        result: Reference('item_stack')
      },
      'minecraft:smithing_transform': {
        template: Opt(Reference('recipe_ingredient')),
        base: Opt(Reference('recipe_ingredient')),
        addition: Opt(Reference('recipe_ingredient')),
        result: Reference('item_stack')
      },
      'minecraft:smithing_trim': {
        template: Opt(Reference('recipe_ingredient')),
        base: Opt(Reference('recipe_ingredient')),
        addition: Opt(Reference('recipe_ingredient'))
      }
    }
  }, { context: 'recipe', disableSwitchContext: true }), {
    default: () => ({
      type: 'minecraft:crafting_shaped'
    })
  }))

  schemas.register('recipe_ingredient', Mod(Tag({ resource: 'item' }), {
    default: () => 'minecraft:stone'
  }))
}
