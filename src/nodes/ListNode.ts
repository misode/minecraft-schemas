import { INode, Base } from './Node'
import { TreeView } from '../view/TreeView'
import { Path } from '../model/Path'
import { locale } from '../Registries'

export const ListNode = (children: INode): INode<any[]> => {
  const renderEntry = (path: Path, value: any, view: TreeView) => {
    const button = view.registerClick(el => {
      view.model.set(path, undefined)
    })
    return `<div class="node-entry">
      ${children.render(path, value, view, {
        hideLabel: true,
        removeId: button,
        removeLabel: locale(path.push('entry'))
      })}
    </div>`
  }

  return ({
    ...Base,
    transform(path, value, view) {
      if (!(value instanceof Array)) return undefined
      return value.map((obj, index) => 
        children.transform(path.push(index), obj, view)
      )
    },
    render(path, value, view) {
      value = value || []
      const button = view.registerClick(el => {
        view.model.set(path, [...value, children.default()])
      })
      return `<div class="node list-node">
        <div class="node-header">
          <label>${locale(path)}</label>
          <button class="add" data-id="${button}"></button>
        </div>
        <div class="node-body">
          ${value.map((obj, index) => {
            return renderEntry(path.push(index), obj, view)
          }).join('')}
        </div>
      </div>`
    },
    validate(path, value, errors) {
      if (!(value instanceof Array)) {
        return errors.add(path, 'error.expected_list')
      }
      let allValid = true
      value.forEach((obj, index) => {
        if (!children.validate(path.push(index), obj, errors)) {
          allValid = false
        }
      })
      return allValid
    }
  })
}
