import { INode } from '../../nodes/Node'

export const Resource = (node: INode<string>): INode<string> => ({
  ...node,
  validate: (path, value, errors, options) => {
    const val = node.validate(path, value, errors, options)
    if (typeof value === 'string' && value.length !== 0 && !value.startsWith('minecraft:')) {
      return 'minecraft:' + val
    }
    return val
  }
})
