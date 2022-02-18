import {
  StringNode as RawStringNode,
  Mod,
  ObjectNode,
  Reference as RawReference,
  SchemaRegistry,
  CollectionRegistry,
  Switch,
  Case,
  NumberNode,
	INode,
	ChoiceNode,
	ListNode,
	Opt,
	ModelPath,
	Errors,
	NodeOptions,
} from '@mcschema/core'
import { Tag } from '../Common'

export function initStructureSetSchemas(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)
  const Reference = RawReference.bind(undefined, schemas)

	schemas.register('structure_set', ObjectNode({
		structures: ListNode(
			ObjectNode({
				structure: Tag({ resource: '$worldgen/configured_structure_feature' }),
				weight: NumberNode({ integer: true, min: 1 })
			})
		),
		placement: Reference('structure_placement')
	}, { context: 'structure_set' }))

	
  schemas.register('structure_placement', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/structure_placement' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'minecraft:concentric_rings': {
        distance: NumberNode({ integer: true, min: 0, max: 1023 }),
        spread: NumberNode({ integer: true, min: 0, max: 1023 }),
        count: NumberNode({ integer: true, min: 1, max: 4095 })
      },
      'minecraft:random_spread': {
        spread_type: Opt(StringNode({ enum: ['linear', 'triangular'] })),
        spacing: NumberNode({ integer: true, min: 0, max: 4096 }),
        separation: Mod(NumberNode({ integer: true, min: 0, max: 4096 }), (node: INode) => ({
          validate: (path: ModelPath, value: any, errors: Errors, options: NodeOptions) => {
            if (path.pop().push('spacing').get() <= value) {
              errors.add(path, 'error.separation_smaller_spacing')
            }
            return node.validate(path, value, errors, options)
          }
        })),
        salt: NumberNode({ integer: true, min: 0 }),
        locate_offset: Opt(ListNode(
          NumberNode({ integer: true, min: -16, max: 16 }),
          { minLength: 3, maxLength: 3 }
        ))
      }
    }
  }, { context: 'structure_placement' }), {
    default: () => ({
      type: 'minecraft:random_spread',
      spacing: 10,
      separation: 5,
      salt: Math.floor(Math.random() * 2147483647)
    })
	}))
}
