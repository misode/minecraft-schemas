import { INode, Base } from './Node'
import { Path } from '../model/Path'
import { TreeView } from '../view/TreeView'
import { DataModel } from '../model/DataModel'
import { Errors } from '../model/Errors'

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
  [Switch]?: (path: Path) => Path
  /** Map of filter values to node fields */
  [Case]?: NestedNodeChildren
}

type ObjectConfig = {
  collapse?: boolean,
  category?: string
}

export const ObjectNode = (fields: FilteredChildren, config?: ObjectConfig): INode<IObject> => {
  const {[Switch]: filter, [Case]: cases, ...defaultFields} = fields

  const getActiveFields = (path: Path, model: DataModel): NodeChildren => {
    if (filter === undefined) return defaultFields
    const switchValue = filter(path.withModel(model)).get()
    const activeCase = cases![switchValue]
    return {...defaultFields, ...activeCase}
  }

  const renderFields = (path: Path, value: IObject, view: TreeView) => {
    value = value ?? {}
    const activeFields = getActiveFields(path, view.model)
    return Object.keys(activeFields).map(f => {
      if (!activeFields[f].enabled(path, view.model)) return ''
      return activeFields[f].render(path.push(f), value[f], view)
    }).join('')
  }

  return ({
    ...Base,
    default: () => ({}),
    transform(path, value, view) {
      if (value === undefined || value === null || typeof value !== 'object') {
        return value
      }
      let res: any = {}
      const activeFields = getActiveFields(path, view.model)
      Object.keys(activeFields).forEach(f => {
        return res[f] = activeFields[f].transform(path.push(f), value[f], view)
      })
      return res
    },
    render(path, value, view, options) {
      return `<div class="node object-node"${config?.category ? `data-category="${config?.category}"` : ''}>
        ${options?.hideLabel ? `` : `<div class="node-header" ${path.error()}>
          ${options?.removeId ? `
            <button class="remove" data-id="${options?.removeId}">
              ${options?.removeLabel ? options?.removeLabel : ''}
            </button>
          ` : ``}
          ${options?.removeLabel ? `` : `
            ${options?.collapse || config?.collapse ? value === undefined ? `
              <label class="collapse closed" data-id="${view.registerClick(() => view.model.set(path, this.default()))}">
                ${path.locale()}
              </label>
            `: `
              <label class="collapse open" data-id="${view.registerClick(() => view.model.set(path, undefined))}">
                ${path.locale()}
              </label>
            ` : `
              <label>${path.locale()}</label>
            `}
          `}
        </div>`}
        ${(typeof value !== 'object' && value !== undefined) || ((options?.collapse || config?.collapse) && value === undefined) ? `` : `
          <div class="node-body">
            ${renderFields(path, value, view)}
          </div>
        `}
      </div>`
    },
    validate(path, value, errors) {
      value = value ?? {}
      if (typeof value !== 'object') {
        errors.add(path, 'error.expected_object')
        return value
      }
      let res: any = {};
      let activeFields = defaultFields
      if (filter) {
        const filterPath = filter(path)
        let switchValue = filterPath.get()
        if (path.equals(filterPath)) {
          const filterField = filterPath.last()
          defaultFields[filterField].validate(path.push(filterField), value[filterField], new Errors())
        }  
        activeFields = {...activeFields, ...cases![switchValue]}
      }
      const activeKeys = Object.keys(activeFields)
      const forcedKeys = activeKeys.filter(k => activeFields[k].force())
      const keys = new Set([...forcedKeys, ...Object.keys(value)])
      keys.forEach(k => {
        res[k] = activeKeys.includes(k) ? activeFields[k].validate(path.push(k), value[k], errors) : value[k]
      })
      return res
    }
  })
}
