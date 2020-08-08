import { INode, Base } from './Node'
import { Path, ModelPath } from '../model/Path'
import { TreeView } from '../view/TreeView'
import { Errors } from '../model/Errors'
import { quoteString } from '../utils'

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
  [Switch]?: (path: ModelPath) => ModelPath
  /** Map of filter values to node fields */
  [Case]?: NestedNodeChildren
}

type ObjectNodeConfig = {
  collapse?: boolean,
  context?: string,
  disableSwitchContext?: boolean,
  category?: string
}

export const ObjectNode = (fields: FilteredChildren, config?: ObjectNodeConfig): INode<IObject> => {
  const { [Switch]: filter, [Case]: cases, ...defaultFields } = fields

  const getActiveFields = (path: ModelPath): NodeChildren => {
    if (filter === undefined) return defaultFields
    const switchValue = filter(path).get()
    const activeCase = cases![switchValue]
    return { ...defaultFields, ...activeCase }
  }

  const getChildModelPath = (path: ModelPath, childKey: string): ModelPath => {
    const switchValue = filter?.(path).get()
    const caseFields = filter ? (cases![switchValue] ?? {}) : {}
    const caseKeys = Object.keys(caseFields)
    const pathWithContext = (config?.context) ?
      new ModelPath(path.getModel(), new Path(path.getArray(), [config.context])) : path
    const pathWithFilter = !config?.disableSwitchContext && switchValue && caseKeys.includes(childKey) ?
      pathWithContext.localePush(switchValue) : pathWithContext
    return pathWithFilter.push(childKey)
  }

  const renderFields = (path: ModelPath, value: IObject, view: TreeView) => {
    value = value ?? {}
    const activeFields = getActiveFields(path)
    return Object.keys(activeFields)
      .filter(k => activeFields[k].enabled(path, view.model))
      .map(k => activeFields[k].render(getChildModelPath(path, k), value[k], view))
      .join('')
  }

  return ({
    ...Base,
    default: () => ({}),
    keep: () => config?.collapse ?? false,
    navigate(path, index) {
      const nextIndex = index + 1
      const pathElements = path.getArray()
      if (pathElements.length <= nextIndex) {
        return this
      }
      const activeFields = getActiveFields(path.slice(0, nextIndex))
      const node = activeFields[pathElements[nextIndex]]
      return node?.navigate(path, nextIndex)
    },
    pathPush(path, key) {
      return getChildModelPath(path, key.toString())
    },
    transform(path, value, view) {
      if (value === undefined || value === null || typeof value !== 'object') {
        return value
      }
      let res: any = {}
      const activeFields = getActiveFields(path)
      Object.keys(activeFields)
        .filter(k => activeFields[k].enabled(path, view.model))
        .forEach(f => {
          res[f] = activeFields[f].transform(path.push(f), value[f], view)
        })
      return res
    },
    render(path, value, view, options) {
      return `<div class="node object-node"${config?.category ? `data-category="${config?.category}"` : ''}>
        ${options?.hideHeader ? '' : `<div class="node-header" ${path.error()} ${path.help()}>
          ${options?.prepend ? options.prepend : `
            ${(options?.collapse || config?.collapse) ? value === undefined ? `
              <button class="collapse closed" data-id="${view.registerClick(() => view.model.set(path, { __init: true }))}"></button>
            `: `
              <button class="collapse open" data-id="${view.registerClick(() => view.model.set(path, undefined))}"></button>
            ` : ``}
          `}
          <label>${options?.label ?? path.locale()}</label>
          ${options?.inject ?? ''}
          ${view.nodeInjector(path, view)}
        </div>`}
        ${(typeof value !== 'object' && value !== undefined) || ((options?.collapse || config?.collapse) && value === undefined) ? `` : `
          <div class="node-body">
            ${renderFields(path, value, view)}
          </div>
        `}
      </div>`
    },
    suggest(path, value) {
      const activeFields = getActiveFields(path)
      const existingKeys = Object.keys(typeof value === 'object' ? value : {})
      return Object.keys(activeFields)
        .filter(k => !existingKeys.includes(k))
        .map(quoteString)
    },
    validate(path, value, errors, options) {
      if (options.loose && typeof value !== 'object') {
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
        if (!activeFields[k].enabled(path, path.getModel())) return
        if (activeKeys.includes(k)) {
          const newValue = activeFields[k].validate(path.push(k), value[k], errors, newOptions)
          if (!activeFields[k].keep()
             && (newValue === undefined
              || (Array.isArray(newValue) && newValue.length === 0)
              || (newValue.constructor === Object && Object.keys(newValue).length === 0))) {
            res[k] = undefined
          } else {
            res[k] = newValue
            path.getModel()!.set(path.push(k), newValue, true)
          }
        } else if (!k.startsWith('__')) {
          res[k] = value[k]
        }
      })
      return res
    }
  })
}
