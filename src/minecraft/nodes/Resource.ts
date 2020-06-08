import { INode } from '../../nodes/Node'

export const Resource = (node: INode<string>): INode<string> => ({
  ...node,
  transform: (path, value, view) => {
    if (value === undefined || value.length === 0) return undefined
    if (value.startsWith('minecraft:')) {
      return node.transform(path, value, view)
    }
    return node.transform(path, 'minecraft:' + value, view)
  }
})
