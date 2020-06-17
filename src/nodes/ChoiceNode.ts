import { INode, Base, RenderOptions } from './Node'
import { Path } from '../model/Path'
import { TreeView } from '../view/TreeView'
import { ListNode } from './ListNode'

type ChoiceType = 'object' | 'list' | 'string' | 'number' | 'boolean' | 'never'

type Choice = [
  ChoiceType,
  INode<any>,
  (old: any) => any
]
/**
 * Node that allows multiple types
 */
export const ChoiceNode = (choices: Choice[]): INode<any> => {
  const isValid = (choice: ChoiceType, value: any) => {
    switch(choice) {
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
    render(path: Path, value: any, view: TreeView, options?: RenderOptions) {
      const choice = activeChoice(value) ?? choices[0]
      let inject = choices.map(c => {
        if (c[0] === choice[0]) {
          return `<button class="selected" disabled>${path.push(c[0]).locale()}</button>`
        }
        const buttonId = view.registerClick(el => {
          view.model.set(path, c[2](value))
        })
        return `<button data-id="${buttonId}">${path.push(c[0]).locale()}</button>`
      }).join('')

      return choice[1]?.render(path, value, view, {...options, hideLabel: false, inject: inject})
    },
    validate(path, value, errors) {
      const choice = activeChoice(value)
      if (choice === undefined) {
        return value
      }
      return choice[1].validate(path, value, errors)
    }
  }
}

export const ObjectOrList = (node: INode<any>): INode<any> => {
  return ChoiceNode([
    [ 'object', node, v => v[0] ],
    [ 'list', ListNode(node), v => [v] ]
  ])
}
