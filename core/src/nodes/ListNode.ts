import { Hook } from '../Hook'
import { ModelPath } from '../model/Path'
import { INode, Base } from './Node'

export type ListHookParams = {
  children: INode
}

export const ListNode = (children: INode): INode<any[]> => {
  return ({
    ...Base,
    type: () => 'list',
    default: () => [],
    navigate(path, index) {
      const nextIndex = index + 1
      const pathElements = path.getArray()
      if (pathElements.length <= nextIndex) {
        return this
      }
      return children.navigate(path, nextIndex)
    },
    pathPush(path, index) {
      return path.push(parseInt(index.toString())).localePush('entry')
    },
    transform(path, value) {
      if (!Array.isArray(value)) return value
      return value.map((obj, index) =>
        children.transform(path.push(index), obj)
      )
    },
    validate(path, value, errors, options) {
      if (options.loose && !Array.isArray(value)) {
        value = this.default()
      }
      if (!Array.isArray(value)) {
        errors.add(path, 'error.expected_list')
        return value
      }
      return value.map((obj, index) =>
        children.validate(path.push(index), obj, errors, options)
      )
    },
    hook<U extends any[], V>(hook: Hook<U, V>, path: ModelPath, ...args: U) {
      return hook.list({ node: this, children }, path, ...args)
    }
  })
}
