import { INode, Base } from './Node'
import { Path } from '../model/Path'
import { ListNode } from './ListNode'

type ChoiceType = 'object' | 'list' | 'string' | 'number' | 'boolean' | 'never'

type Choice = {
  type: ChoiceType,
  node: INode<any>,
  change?: (old: any) => any
}

type ChoiceNodeConfig = {
  context?: string,
  choiceContext?: string
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
    const index = choices.map(choice => isValid(choice.type, value)).indexOf(true)
    if (index === -1) return undefined
    return choices[index]
  }

  return {
    ...Base,
    default: () => choices[0].node.default(),
    keep: () => true,
    navigate(path, index) {
      const pathElement = path.getArray()[index + 1]
      const expectedChoiceType = typeof pathElement === 'number' ? 'list' : 'object'
      const node = choices.find(c => c.type === expectedChoiceType)?.node
      return node?.navigate(path, index)
    },
    transform(path, value, view) {
      const choice = activeChoice(value)
      if (choice === undefined) {
        return value
      }
      return choice.node.transform(path, value, view)
    },
    render(path, value, view, options) {
      const choice = activeChoice(value) ?? choices[0]
      const pathWithContext = (config?.context) ?
        new Path(path.getArray(), [config.context], path.getModel()) : path
      const pathWithChoiceContext = config?.choiceContext ? new Path([], [config.choiceContext]) : path
      let inject = choices.map(c => {
        if (c.type === choice.type) {
          return `<button class="selected" disabled>${pathWithChoiceContext.push(c.type).locale()}</button>`
        }
        const buttonId = view.registerClick(el => {
          view.model.set(path, c.change ? c.change(value) : c.node.default())
        })
        return `<button data-id="${buttonId}">${pathWithChoiceContext.push(c.type).locale()}</button>`
      }).join('')

      return choice.node.render(pathWithContext, value, view, {
        ...options,
        label: options?.hideHeader ? '' : undefined,
        hideHeader: false,
        inject
      })
    },
    suggest(path, value) {
      return choices
        .filter(c => value === undefined || isValid(c.type, value))
        .map(c => c.node.suggest(path, value))
        .reduce((p, c) => p.concat(c))
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
      return choice.node.validate(path, value, errors, options)
    }
  }
}

export const ObjectOrList = (node: INode<any>, config?: ChoiceNodeConfig): INode<any> => {
  return ChoiceNode([
    {
      type: 'object',
      node, 
      change: v => v[0]
    },
    {
      type: 'list',
      node: ListNode(node),
      change: v => [v]
    }
  ], config)
}
