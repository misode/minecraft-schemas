import { INode } from './Node'

export const Resource = (node: INode<string>): INode<string> => ({
  ...node,
  validate: (path, value, errors, options) => {
    if (typeof value === 'string' && value.length !== 0 && !value.includes(':')) {
      value = 'minecraft:' + value
    }
    return node.validate(path, value, errors, options)
  }
})
