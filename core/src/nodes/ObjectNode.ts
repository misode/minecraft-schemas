import { INode, Base } from './Node'
import { Path, ModelPath } from '../model/Path'
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

  return ({
    ...Base,
    type: () => 'object',
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
    transform(path, value, view) {
      if (value === undefined || value === null || typeof value !== 'object') {
        return value
      }
      let res: any = {}
      const activeFields = getActiveFields(path)
      Object.keys(activeFields)
        .filter(k => activeFields[k].enabled(path))
        .forEach(f => {
          res[f] = activeFields[f].transform(path.push(f), value[f], view)
        })
      return res
    },
    render(path, value, view) {
      let prefix = ''
      if (this.optional()) {
        if (value === undefined) {
          prefix = `<button class="collapse closed" data-id="${view.registerClick(() => view.model.set(path, this.default()))}"></button>`
        } else {
          prefix = `<button class="collapse open" data-id="${view.registerClick(() => view.model.set(path, undefined))}"></button>`
        }
      }
      let suffix = view.nodeInjector(path, view)
      let body = ''
      if (typeof value === 'object' && value !== undefined && (!(this.optional() && value === undefined))) {
        const activeFields = getActiveFields(path)
        body = Object.keys(activeFields)
          .filter(k => activeFields[k].enabled(path))
          .map(k => {
            const field = activeFields[k]
            const childPath = getChildModelPath(path, k)
            const [cPrefix, cSuffix, cBody] = field.render(childPath, value[k], view)
            return `<div class="node ${field.type(childPath)}-node" ${childPath.error()} ${childPath.help()}>
              <div class="node-header">
                ${cPrefix}
                <label>${childPath.locale()}</label>
                ${cSuffix}
              </div>
              ${cBody ? `<div class="node-body">${cBody}</div>` : ''}
              </div>`
          })
          .join('')
      }
      return [prefix, suffix, body]
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
        value = this.default()
      }
      if (typeof value !== 'object') {
        errors.add(path, 'error.expected_object')
        return value
      }
      let activeFields = defaultFields
      if (filter) {
        const filterPath = filter(path)
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
      let res: any = {}
      keys.forEach(k => {
        if (activeKeys.includes(k)) {
          if (!activeFields[k].enabled(path)) return
          const newValue = activeFields[k].validate(path.push(k), value[k], errors, options)
          if (!activeFields[k].keep() && activeFields[k].optional()
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
