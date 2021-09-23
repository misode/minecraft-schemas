import { describe, it } from 'mocha'
import { ModelPath, Path } from '../model/Path'
import { DataModel } from '../model/DataModel'
import { StringNode } from '../nodes/StringNode'
import { ObjectNode } from '../nodes/ObjectNode'
import { ListNode } from '../nodes/ListNode'
import { Opt } from '../nodes/Node'
import assert from 'power-assert'

describe('DataModel', () => {
	it('Delete last list item', () => {
		const schema = ObjectNode({
			extra: Opt(ListNode(
				StringNode()
			))
		})
		const model = new DataModel(schema)
		const root = new ModelPath(model, new Path([]))
		
		root.push('extra').set(['hello'])
		
		root.push('extra').push(0).set(undefined)
		
		assert(Object.keys(root.get()).length === 0)
	})
})
