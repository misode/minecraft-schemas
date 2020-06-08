import { INode, Base, RenderOptions } from './Node'
import { Path } from '../model/Path'
import { TreeView } from '../view/TreeView'
import { locale } from '../Registries'

type BooleanNodeConfig = {
  radio?: boolean
}

/**
 * Boolean node with two buttons for true/false
 */
export const BooleanNode = (config?: BooleanNodeConfig): INode<boolean> => {
  return {
    ...Base,
    default: () => false,
    render(path: Path, value: boolean, view: TreeView, options?: RenderOptions) {
      const onFalse = view.registerClick(el => {
        view.model.set(path, !config?.radio && value === false ? undefined : false)
      })
      const onTrue = view.registerClick(el => {
        view.model.set(path, !config?.radio && value === true ? undefined : true)
      })
      return `<div class="node boolean-node node-header">
        ${options?.removeId ? `<button data-id="${options?.removeId}"></button>` : ``}
        ${options?.hideLabel ? `` : `<label>${locale(path)}</label>`}
        <button${value === false ? ' class="selected"' : ' '} 
          data-id="${onFalse}">${locale('false')}</button>
        <button${value === true ? ' class="selected"' : ' '} 
          data-id="${onTrue}">${locale('true')}</button>
      </div>`
    },
    validate(path, value, errors) {
      if (typeof value !== 'boolean' || value === undefined) {
        return errors.add(path, 'error.expected_boolean')
      }
      return true
    }
  }
}
