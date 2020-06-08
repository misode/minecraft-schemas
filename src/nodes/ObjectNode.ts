import { INode, Base } from './Node'
import { Path } from '../model/Path'
import { TreeView } from '../view/TreeView'
import { locale } from '../Registries'
import { DataModel } from '../model/DataModel'

export const Switch = Symbol('switch')
export const Case = Symbol('case')

export type NodeChildren = {
  [name: string]: INode
}

export type NestedNodeChildren = {
  [name: string]: NodeChildren
}

export type IObject = {
  [name: string]: any
}

export type FilteredChildren = {
  [name: string]: INode
  /** The field to filter on */
  [Switch]?: (path: Path) => any
  /** Map of filter values to node fields */
  [Case]?: NestedNodeChildren
}

type ObjectConfig = {
  collapse?: boolean,
  category?: string
}

export const ObjectNode = (fields: FilteredChildren, config?: ObjectConfig): INode<IObject> => {
  const {[Switch]: filter, [Case]: cases, ...defaultFields} = fields

  const getActiveFields = (path: Path, model: DataModel) => {
    if (filter === undefined) return defaultFields 
    const switchValue = filter(path.withModel(model))
    const activeCase = cases![switchValue]
    return {...defaultFields, ...activeCase}
  }

  const renderFields = (path: Path, value: IObject, view: TreeView) => {
    value = value ?? {}
    const activeFields = getActiveFields(path, view.model)
    return Object.keys(activeFields).map(f => {
      if (!activeFields[f].enabled(path.push(f), view.model)) return ''
      return activeFields[f].render(path.push(f), value[f], view)
    }).join('')
  }

  return ({
    ...Base,
    default: () => ({}),
    transform(path, value, view) {
      if (value === undefined) return undefined
      let res: any = {}
      const activeFields = getActiveFields(path, view.model)
      Object.keys(activeFields).forEach(f => {
        return res[f] = activeFields[f].transform(path.push(f), value[f], view)
      })
      return res
    },
    render(path, value, view, options) {
      return `<div class="node object-node"${config?.category ? `data-category="${config?.category}"` : ''}>
        ${options?.hideLabel ? `` : `<div class="node-header">
          ${options?.removeId ? `
            <button class="remove" data-id="${options?.removeId}">
              ${options?.removeLabel ? options?.removeLabel : ''}
            </button>
          ` : ``}
          ${options?.removeLabel ? `` : `
            ${options?.collapse || config?.collapse ? value === undefined ? `
              <label class="collapse closed" data-id="${view.registerClick(() => view.model.set(path, this.default()))}">
                ${locale(path)}
              </label>
            `: `
              <label class="collapse open" data-id="${view.registerClick(() => view.model.set(path, undefined))}">
                ${locale(path)}
              </label>
            ` : `
              <label>${locale(path)}</label>
            `}
          `}
        </div>`}
        ${(options?.collapse || config?.collapse) && value === undefined ? `` : `
          <div class="node-body">
            ${renderFields(path, value, view)}
          </div>
        `}
      </div>`
    },
    validate(path, value, errors) {
      if (value === null || typeof value !== 'object') {
        return errors.add(path, 'error.expected_object')
      }
      const activeFields = getActiveFields(path, path.getModel()!)
      const activeKeys = Object.keys(activeFields)
      let allValid = true
      Object.keys(value).forEach(k => {
        if (!activeKeys.includes(k)) {
          if (filter) {
            const switchValue = filter(path)
            errors.add(path.push(k), 'error.invalid_filtered_key', k, switchValue)
          } else {
            errors.add(path.push(k), 'error.invalid_key', k)
          }
          allValid = false
        } else if (!activeFields[k].validate(path.push(k), value[k], errors)) {
          allValid = false
        }
      })
      return allValid
    }
  })
}
