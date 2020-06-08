import { INode, Base } from './Node'
import { TreeView } from '../view/TreeView'
import { Path } from '../model/Path'
import { locale } from '../Registries'

export type IMap = {
  [name: string]: any
}

/**
 * Map nodes similar to list nodes, but a string key is required to add children
 */
export const MapNode = (keys: INode<string>, children: INode): INode<IMap> => {
  return {
    ...Base,
    transform(path, value, view) {
      if (value === undefined) return undefined
      let res: any = {}
      Object.keys(value).forEach(f =>
        res[f] = children.transform(path.push(f), value[f], view)
      )
      return res;
    },
    render(path, value, view) {
      const onAdd = view.registerClick(el => {
        const key = keys.getState(el.parentElement!)
        view.model.set(path.push(key), children.default())
      })
      return `<div class="node map-node">
        <div class="node-header">
          <label>${locale(path)}</label>
          ${keys.renderRaw(path)}
          <button class="add" data-id="${onAdd}"></button>
        </div>
        <div class="node-body">
          ${Object.keys(value ?? []).map(key => `<div class="node-entry">
            ${children.render(path.push(key), value ?? [], view, {
              removeId: view.registerClick(el => view.model.set(path.push(key), undefined))
            })}
          </div>`).join('')}
        </div>
      </div>`
    },
    validate(path, value, errors) {
      if (value === null || typeof value !== 'object') {
        return errors.add(path, 'error.expected_object')
      }
      let allValid = true
      Object.keys(value).forEach(k => {
        if (!keys.validate(path, k, errors)) {
          allValid = false
        }
        if (!children.validate(path.push(k), value[k], errors)) {
          allValid = false
        }
      })
      return allValid
    }
  }
}
