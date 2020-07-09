import { INode, Base } from './Node'
import { Path } from '../model/Path'
import { ListNode } from './ListNode'

type ChoiceType = 'object' | 'list' | 'string' | 'number' | 'boolean' | 'never'

type Choice = [
  ChoiceType,
  INode<any>,
  (old: any) => any
]

type ChoiceNodeConfig = {
  context?: string
}

/**
 * Node that allows multiple types
 */
export const ChoiceNode = (choices: Choice[], config?: ChoiceNodeConfig): INode<any> => {
  const isValid = (choice: ChoiceType, value: any) => {
    switch (choice) {
      case 'list': return value instanceof Array
      case 'object': return typeof value === 'object' && !(value instanceof Array)
      default: return typeof value === choice
    }
  }
  const activeChoice = (value: any): Choice | undefined => {
    const index = choices.map(choice => isValid(choice[0], value)).indexOf(true)
    if (index === -1) return undefined
    return choices[index]
  }

  return {
    ...Base,
    default: () => choices[0][1].default(),
    keys(path, value) {
      const objectNode = choices.find(([type]) => type === 'object')?.[1]
      const keys = objectNode?.keys(path, value)
      return keys ?? []
    },
    navigate(path, index) {
      const nextIndex = index + 1
      const nextPathElement = path.getArray()[nextIndex]
      const expectedChoiceType = typeof nextPathElement === 'number' ? 'list' : 'object'
      const node = choices.find(([type]) => type === expectedChoiceType)?.[1]
      return node?.navigate(path, nextIndex)
    },
    transform(path, value, view) {
      const choice = activeChoice(value)
      if (choice === undefined) {
        return value
      }
      return choice[1].transform(path, value, view)
    },
    render(path, value, view, options) {
      const choice = activeChoice(value) ?? choices[0]
      const pathWithContext = (config?.context) ?
        new Path(path.getArray(), [config.context], path.getModel()) : path
      let inject = choices.map(c => {
        if (c[0] === choice[0]) {
          return `<button class="selected" disabled>${pathWithContext.push(c[0]).locale()}</button>`
        }
        const buttonId = view.registerClick(el => {
          view.model.set(path, c[2](value))
        })
        return `<button data-id="${buttonId}">${pathWithContext.push(c[0]).locale()}</button>`
      }).join('')

      return choice[1]?.render(pathWithContext, value, view, {
        ...options,
        label: options?.hideHeader ? '' : undefined,
        hideHeader: false,
        inject
      })
    },
    validate(path, value, errors, options) {
      let choice = activeChoice(value)
      if (choice === undefined) {
        if (options.loose) {
          choice = choices[0]
        } else {
          return value
        }
      }
      return choice[1].validate(path, value, errors, options)
    }
  }
}

export const ObjectOrList = (node: INode<any>, config?: ChoiceNodeConfig): INode<any> => {
  return ChoiceNode([
    ['object', node, v => v[0]],
    ['list', ListNode(node), v => [v]]
  ], config)
}
