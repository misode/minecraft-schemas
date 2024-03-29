import { INode, Base } from './Node'
import { Path, ModelPath, RelativePath, relativePath } from '../model/Path'
import { Errors } from '../model/Errors'
import { quoteString } from '../utils'
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
  [Switch]?: RelativePath
  /** Map of filter values to node fields */
  [Case]?: NestedNodeChildren
}

type ObjectNodeConfig = {
  collapse?: boolean,
  context?: string,
  disableSwitchContext?: boolean,
  category?: string
}

export type ObjectHookParams = {
  fields: NodeChildren,
  config: ObjectNodeConfig,
  filter?: RelativePath,
  cases?: NestedNodeChildren,
  getActiveFields: (path: ModelPath) => NodeChildren
  getChildModelPath: (path: ModelPath, childKey: string) => ModelPath
}

export const ObjectNode = (fields: FilteredChildren, config?: ObjectNodeConfig): INode<IObject> => {
  const { [Switch]: filter, [Case]: cases, ...defaultFields } = fields

  const getActiveFields = (path: ModelPath): NodeChildren => {
    if (filter === undefined) return defaultFields
    const switchValue = relativePath(path, filter).get()
    const activeCase = cases![switchValue]
    return { ...defaultFields, ...activeCase }
  }

  const getChildModelPath = (path: ModelPath, childKey: string): ModelPath => {
    const switchValue = filter ? relativePath(path, filter).get() : undefined
    const caseFields = filter ? (cases![switchValue] ?? {}) : {}
    const caseKeys = Object.keys(caseFields)
    const pathWithContext = (config?.context) ?
      new ModelPath(path.getModel(), new Path(path.getArray(), [config.context])) : path
    const pathWithFilter = !config?.disableSwitchContext && switchValue && caseKeys.includes(childKey) ?
      pathWithContext.contextPush(switchValue) : pathWithContext
    return pathWithFilter.push(childKey)
  }

  return ({
    ...Base,
    type: () => 'object',
    category: () => config?.category,
    default: () => ({}),
    keep() {
      return this.optional()
    },
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
    suggest(path, value) {
      const activeFields = getActiveFields(path)
      const existingKeys = Object.keys(typeof value === 'object' ? value : {})
      return Object.keys(activeFields)
        .filter(k => activeFields[k].enabled(path))
        .filter(k => !existingKeys.includes(k))
        .map(quoteString)
    },
    validate(path, value, errors, options) {
      if (options.loose && typeof value !== 'object') {
        value = options.wrapLists ? DataModel.wrapLists(this.default()) : this.default()
      }
      if (typeof value !== 'object' || value === null) {
        errors.add(path, 'error.expected_object')
        return value
      }
      let activeFields = defaultFields
      if (filter) {
        const filterPath = relativePath(path, filter)
        let switchValue = filterPath.get()
        if (path.equals(filterPath.pop())) {
          const filterField = filterPath.last()
          switchValue = defaultFields[filterField].validate(path.push(filterField), value[filterField], new Errors(), options)
        }
        activeFields = { ...activeFields, ...cases![switchValue] }
      }
      const activeKeys = Object.keys(activeFields)
      const forcedKeys = activeKeys.filter(k => !activeFields[k].optional())
      const keys = new Set([...forcedKeys, ...Object.keys(value)])
      const res: any = {}
      keys.forEach(k => {
        if (activeKeys.includes(k)) {
          if (!activeFields[k].enabled(path)) return
          const newValue = activeFields[k].validate(path.push(k), value[k], errors, options)
          if (!activeFields[k].keep() && activeFields[k].optional()
             && (newValue === undefined
              || (Array.isArray(newValue) && newValue.length === 0)
              || (newValue.constructor === Object && Object.keys(newValue).length === 0))) {
            delete res[k]
          } else {
            res[k] = newValue
            path.getModel()!.set(path.push(k), newValue, true)
          }
        } else {
          res[k] = value[k]
        }
      })
      for (const a of Object.getOwnPropertySymbols(value)) {
        res[a] = value[a]
      }
      return res
    },
    hook(hook, path, ...args) {
      return ((hook.object ?? hook.base) as any).call(hook, { node: this, fields: defaultFields, config: config ?? {}, filter, cases, getActiveFields, getChildModelPath }, path, ...args)
    }
  })
}
