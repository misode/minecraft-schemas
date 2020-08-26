import { INode, Base } from './Node'
import { Path, ModelPath } from '../model/Path'
import { ListNode } from './ListNode'
import { SwitchNode } from './SwitchNode'

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
  const switchNode = SwitchNode(choices.map(c => ({
    type: c.type,
    match: (path) => isValid(c, path.get()),
    node: c.node
  })))

  return {
    ...switchNode,
    keep: () => true,
    render(path, value, view, options) {
      const choice = switchNode.activeCase(path) ?? choices[0]
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
    validate(path, value, errors, options) {
      let choice = switchNode.activeCase(path)
      if (choice === undefined) {
        if (options.loose) {
          choice = choices[0]
        } else {
          return value
        }
      }
      if (choice.node.optional()) {
        return value
      }
      return choice.node.validate(path, value, errors, options)
    }
  }
}

const XOrList = (x: string): ((node: INode<any>, config?: ChoiceNodeConfig) => INode<any>) => ((node, config) => {
  return ChoiceNode([
    {
      type: x,
      node,
      change: v => v[0] ?? node.default()
    },
    {
      type: 'list',
      node: ListNode(node),
      change: v => v ? [v] : []
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
