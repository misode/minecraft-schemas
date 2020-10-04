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
  return {
    ...Base,
    type(path) {
      return (this.activeCase(path) ?? cases[cases.length - 1])
        .node.type(path)
    },
    category(path) {
      return (this.activeCase(path) ?? cases[cases.length - 1])
        .node.category(path)
    },
    default: () => cases[0].node.default(),
    navigate(path, index) {
      const nextIndex = index + 1
      return this.activeCase(path.slice(0, nextIndex))
        ?.node
        .navigate(path, index)
    },
    pathPush(path, key) {
      return this.activeCase(path)?.node.pathPush(path, key) ?? path
    },
    transform(path, value) {
      return this.activeCase(path)?.node.transform(path, value) ?? value
    },
    render(path, value, view) {
      return (this.activeCase(path) ?? cases[cases.length - 1])
        .node.render(path, value, view)
    },
    suggest(path, value) {
      return this.activeCase(path)
        ?.node
        .suggest(path, value) ?? cases
          .filter(c => c.match(path))
          .map(c => c.node.suggest(path, value))
          .reduce((p, c) => p.concat(c))
    },
    validate(path, value, errors, options) {
      let c = this.activeCase(path)
      if (c === undefined) {
        return value
      }
      return c.node.validate(path, value, errors, options)
    },
    validationOption(path) {
      return this.activeCase(path)
        ?.node
        .validationOption(path)
    },
    activeCase(path: ModelPath): Case<T> | undefined {
      const index = cases.map(c => c.match(path)).indexOf(true)
      if (index === -1) return undefined
      return cases[index]
    }
  }
}
