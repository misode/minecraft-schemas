import { INode } from '../../nodes/Node'

export const Resource = (node: INode<string>): INode<string> => ({
  ...node,
  transform: (path, value, view) => {
    if (value === undefined) return undefined
    if (value.length === 0 || value.startsWith('minecraft:')) {
      return node.transform(path, value, view)
    }
    return node.transform(path, 'minecraft:' + value, view)
  },
  validate: (path, value, errors) => {
    const val = node.validate(path, value, errors)
    if (typeof value === 'string' && value.length !== 0 && !value.startsWith('minecraft:')) {
      return 'minecraft:' + val
    }
    return val
  }
})
