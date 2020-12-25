import { INode, Base } from './Node'

type ListNodeConfig = {
  minLength?: number
  maxLength?: number
}

export type ListHookParams = {
  children: INode
  config: ListNodeConfig
}

export const ListNode = (children: INode, config?: ListNodeConfig): INode<any[]> => {
  const min = config?.minLength ?? 0
  const max = config?.maxLength ?? Infinity
  const between = config?.minLength && config?.maxLength
  return ({
    ...Base,
    type: () => 'list',
    default: () => config?.minLength ? [...Array(min)].map(_ => children.default()) : [],
    navigate(path, index) {
      const nextIndex = index + 1
      const pathElements = path.getArray()
      if (pathElements.length <= nextIndex) {
        return this
      }
      return children.navigate(path, nextIndex)
    },
    pathPush(path, index) {
      return path.push(parseInt(index.toString())).contextPush('entry')
    },
    validate(path, value, errors, options) {
      if (options.loose && !Array.isArray(value)) {
        value = this.default()
      }
      if (!Array.isArray(value)) {
        errors.add(path, 'error.expected_list')
        return value
      } else if (between && (value.length < min || value.length > max)) {
        if (min === max) {
          errors.add(path, 'error.invalid_list_range.exact', value.length, min)
        } else {
          errors.add(path, 'error.invalid_list_range.between', value.length, min, max)
        }
      } else if (value.length < min) {
        errors.add(path, 'error.invalid_list_range.smaller', value.length, min)
      } else if (value.length > max) {
        errors.add(path, 'error.invalid_list_range.larger', value.length, max)
      }
      return value.map((obj, index) =>
        children.validate(path.push(index), obj, errors, options)
      )
    },
    serialize() {
      return {
        type: 'list',
        optional: this.optional() ? true : undefined,
        values: children.serialize(),
        ...config
      }
    },
    hook(hook, path, ...args) {
      return hook.list({ node: this, children, config: config ?? {} }, path, ...args)
    }
  })
}
