import { INode, Base } from './Node'
import { TreeView } from '../view/TreeView'
import { Path } from '../model/Path'
import { locale } from '../Registries'

export const ListNode = (children: INode): INode<any[]> => {
  const renderEntry = (path: Path, value: any, view: TreeView) => {
    return 
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
      value = value ?? []
      const onAdd = view.registerClick(el => {
        view.model.set(path, [...value, children.default()])
      })
      return `<div class="node list-node">
        <div class="node-header">
          <label>${locale(path)}</label>
          <button class="add" data-id="${onAdd}"></button>
        </div>
        <div class="node-body">
          ${(value ?? []).map((obj, index) => `<div class="node-entry">
            ${children.render(path.push(index), obj, view, {
              removeId: view.registerClick(el => view.model.set(path.push(index), undefined)),
              removeLabel: locale(path.push('entry'))
            })}
          </div>`).join('')}
        </div>
      </div>`
    },
    validate(path, value, errors) {
      if (!(value instanceof Array)) {
        errors.add(path, 'error.expected_list')
        return value
      }
      return value.map((obj, index) =>
        children.validate(path.push(index), obj, errors)
      )
    }
  })
}
