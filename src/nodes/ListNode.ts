import { INode, Base } from './Node'
import { TreeView } from '../view/TreeView'
import { Path } from '../model/Path'

export const ListNode = (children: INode): INode<any[]> => {
  const renderEntry = (path: Path, value: any, view: TreeView) => {
    return 
  }

  return ({
    ...Base,
    transform(path, value, view) {
      if (!(value instanceof Array)) return value
      return value.map((obj, index) => 
        children.transform(path.push(index), obj, view)
      )
    },
    render(path, value, view) {
      value = value ?? []
      const onAdd = view.registerClick(el => {
        if (!(value instanceof Array)) value = []
        view.model.set(path, [...value, children.default()])
      })
      return `<div class="node list-node">
        <div class="node-header" ${path.error()}>
          <label>${path.locale()}</label>
          <button class="add" data-id="${onAdd}"></button>
        </div>
        ${!(value instanceof Array) ? `` :
          `<div class="node-body">
          ${(value ?? []).map((obj, index) => `<div class="node-entry">
            ${children.render(path.push(index), obj, view, {
              removeId: view.registerClick(el => view.model.set(path.push(index), undefined)),
              removeLabel: path.push('entry').locale()
            })}
          </div>`).join('')}
        </div>`}
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
