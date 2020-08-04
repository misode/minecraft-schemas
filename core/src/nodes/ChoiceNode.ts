import { INode, Base } from './Node'
import { Path, ModelPath } from '../model/Path'
import { ListNode } from './ListNode'

type Choice = {
  type: string
  node: INode<any>
  match?: (value: any) => boolean
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
  const isValid = (choice: Choice, value: any) => {
    if (choice.match) {
      return choice.match(value)
    } 
    switch (choice.type) {
      case 'list': return Array.isArray(value)
      case 'object': return typeof value === 'object' && !(value instanceof Array)
      default: return typeof value === choice.type
    }
  }
  const activeChoice = (value: any): Choice | undefined => {
    const index = choices.map(choice => isValid(choice, value)).indexOf(true)
    if (index === -1) return undefined
    return choices[index]
  }

  return {
    ...Base,
    default: () => choices[0].node.default(),
    keep: () => true,
    navigate(path, index, value) {
      const nextIndex = index + 1
      if (path.getArray().length <= nextIndex) {
        return this
      }
      const node = activeChoice(value)?.node
      return node?.navigate(path, index, value)
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
        new ModelPath(path.getModel(), new Path(path.getArray(), [config.context])) : path
      const pathWithChoiceContext = config?.choiceContext ? new Path([], [config.choiceContext]) : config?.context ? new Path([], [config.context]) : path
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
        label: path.locale(),
        hideHeader: false,
        inject
      })
    },
    suggest(path, value) {
      return choices
        .filter(c => value === undefined || isValid(c, value))
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
    },
    validationOption(value) {
      return activeChoice(value)
        ?.node
        ?.validationOption(value)
    }
  }
}

const XOrList = (x: string): ((node: INode<any>, config?: ChoiceNodeConfig) => INode<any>) => ((node, config) => {
  return ChoiceNode([
    {
      type: x,
      node,
      change: v => v[0]
    },
    {
      type: 'list',
      node: ListNode(node),
      change: v => [v]
    }
  ], config)
})

export const ObjectOrList = XOrList('object')

export const StringOrList = XOrList('string')

export const ObjectOrPreset = (presetNode: INode<string>, objectNode: INode<any>, presets: {[preset: string]: any}): INode<any> => {
  return ChoiceNode([
    {
      type: 'string',
      node: presetNode,
      change: v => Object.keys(presets)[0]
    },
    {
      type: 'object',
      node: objectNode,
      change: v => presets[v] ?? presets[Object.keys(presets)[0]]
    }
  ])
}
