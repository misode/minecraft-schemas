import { INode, Base } from './Node'
import { Path } from '../model/Path'
import { TreeView } from '../view/TreeView'
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

type ObjectNodeConfig = {
  allowEmpty?: boolean,
  collapse?: boolean,
  context?: string,
  disableSwitchContext?: boolean,
  category?: string
}

export const ObjectNode = (fields: FilteredChildren, config?: ObjectNodeConfig): INode<IObject> => {
  const { [Switch]: filter, [Case]: cases, ...defaultFields } = fields

  const getActiveFields = (path: Path): NodeChildren => {
    if (filter === undefined) return defaultFields
    const switchValue = filter(path).get()
    const activeCase = cases![switchValue]
    return { ...defaultFields, ...activeCase }
  }

  const renderFields = (path: Path, value: IObject, view: TreeView) => {
    value = value ?? {}
    const filterPath = filter ? filter(path) : new Path()
    const switchValue = filterPath.get()
    const caseFields = filter ? cases![switchValue] : {}
    const activeFields = filter ? { ...defaultFields, ...caseFields } : defaultFields
    const filteredKeys = caseFields ? Object.keys(caseFields) : []
    return Object.keys(activeFields).map(k => {
      if (!activeFields[k].enabled(path, view.model)) return ''
      const pathWithContext = (config?.context) ?
        new Path(path.getArray(), [config.context], path.getModel()) : path
      const pathWithFilter = !config?.disableSwitchContext && switchValue && filteredKeys.includes(k) ?
        pathWithContext.localePush(switchValue) : pathWithContext
      return activeFields[k].render(pathWithFilter.push(k), value[k], view)
    }).join('')
  }

  return ({
    ...Base,
    default: () => ({}),
    keys(path, value) {
      const activeFields = getActiveFields(path)
      const existingKeys = Object.keys(typeof value === 'object' ? value : {})
      return Object.keys(activeFields).filter(k => !existingKeys.includes(k))
    },
    navigate(path, index) {
      const nextIndex = index + 1
      const pathElements = path.getArray()
      if (pathElements.length <= nextIndex) {
        return undefined
      }
      const activeFields = getActiveFields(path.slice(0, nextIndex))
      const node = activeFields[pathElements[nextIndex]]
      return node?.navigate(path, nextIndex)
    },
    transform(path, value, view) {
      if (value === undefined || value === null || typeof value !== 'object') {
        return value
      }
      let res: any = {}
      const activeFields = getActiveFields(path)
      Object.keys(activeFields).forEach(f => {
        return res[f] = activeFields[f].transform(path.push(f), value[f], view)
      })
      return res
    },
    render(path, value, view, options) {
      return `<div class="node object-node"${config?.category ? `data-category="${config?.category}"` : ''}>
        ${options?.hideHeader ? '' : `<div class="node-header" ${path.error()}>
          ${options?.prepend ? options.prepend : `
            ${(options?.collapse || config?.collapse) ? value === undefined ? `
              <button class="collapse closed" data-id="${view.registerClick(() => view.model.set(path, { __init: true }))}"></button>
            `: `
              <button class="collapse open" data-id="${view.registerClick(() => view.model.set(path, undefined))}"></button>
            ` : ``}
          `}
          <label>${options?.label ?? path.locale()}</label>
          ${options?.inject ?? ''}
        </div>`}
        ${(typeof value !== 'object' && value !== undefined) || ((options?.collapse || config?.collapse) && value === undefined) ? `` : `
          <div class="node-body">
            ${renderFields(path, value, view)}
          </div>
        `}
      </div>`
    },
    validate(path, value, errors, options) {
      if (options.loose && value === undefined) {
        value = {}
      }
      if (typeof value !== 'object') {
        errors.add(path, 'error.expected_object')
        return value
      }
      const newOptions = (value.__init) ? { ...options, init: true } : options
      let activeFields = defaultFields
      if (filter) {
        const filterPath = filter(path)
        let switchValue = filterPath.get()
        if (path.equals(filterPath.pop())) {
          const filterField = filterPath.last()
          switchValue = defaultFields[filterField].validate(path.push(filterField), value[filterField], new Errors(), newOptions)
        }
        activeFields = { ...activeFields, ...cases![switchValue] }
      }
      const activeKeys = Object.keys(activeFields)
      const forcedKeys = activeKeys.filter(k => activeFields[k].force())
      const keys = new Set([...forcedKeys, ...Object.keys(value)])
      let res: any = {}
      keys.forEach(k => {
        if (activeKeys.includes(k)) {
          const newValue = activeFields[k].validate(path.push(k), value[k], errors, newOptions)
          if (newValue !== undefined) {
            res[k] = newValue
          }
        } else if (!k.startsWith('__')) {
          res[k] = value[k]
        }
      })
      if (!config?.allowEmpty && Object.keys(res).length === 0
        && !(config?.collapse || options.collapse)) {
        if (options.loose) {
          return undefined
        }
      }
      return res
    }
  })
}
