import { INode, Base } from './Node'
import { ModelPath } from '../model/Path'

type Case<T> = {
  match: (path: ModelPath) => boolean
  node: INode<T>
}

/**
 * Node that allows multiple types
 */
export const SwitchNode = <T>(cases: Case<T>[]): INode<T> => {
  const activeCase = (path: ModelPath): Case<T> | undefined => {
    const index = cases.map(c => c.match(path)).indexOf(true)
    if (index === -1) return undefined
    return cases[index]
  }

  return {
    ...Base,
    default: () => cases[0].node.default(),
    navigate(path, index, value) {
      const nextIndex = index + 1
      if (path.getArray().length <= nextIndex) {
        return this
      }
      const node = activeCase(path)?.node
      return node?.navigate(path, index, value)
    },
    pathPush(path, key) {
      return activeCase(path.get())?.node.pathPush(path, key) ?? path
    },
    transform(path, value, view) {
      return activeCase(path)?.node.transform(path, value, view) ?? value
    },
    render(path, value, view, options) {
      return (activeCase(path) ?? cases[cases.length - 1])
        .node.render(path, value, view, options)
    },
    suggest(path, value) {
      return cases
        .filter(c => value === undefined || c.match(path))
        .map(c => c.node.suggest(path, value))
        .reduce((p, c) => p.concat(c))
    },
    validate(path, value, errors, options) {
      let c = activeCase(path)
      if (c === undefined) {
        return value
      }
      return c.node.validate(path, value, errors, options)
    }
  }
}
