import { INode, Base } from './Node'
import { ValidationOption } from '../ValidationOption'
import { quoteString } from '../utils'

export type IMap = {
  [name: string]: any
}

type MapNodeConfig = {
  validation?: ValidationOption
}

/**
 * Map nodes similar to list nodes, but a string key is required to add children
 */
export const MapNode = (keys: INode<string>, children: INode, config?: MapNodeConfig): INode<IMap> => {
  return {
    ...Base,
    default: () => ({}),
    navigate(path, index, value) {
      const nextIndex = index + 1
      const pathElements = path.getArray()
      if (pathElements.length <= nextIndex) {
        return this
      }
      return children.navigate(path, nextIndex, value ? value[pathElements[nextIndex]] : undefined)
    },
    transform(path, value, view) {
      if (value === undefined) return undefined
      let res: any = {}
      Object.keys(value).forEach(f =>
        res[f] = children.transform(path.push(f), value[f], view)
      )
      return res;
    },
    render(path, value, view, options) {
      const onAdd = view.registerClick(el => {
        const key = keys.getState(el.parentElement!)
        view.model.set(path.push(key), children.default())
      })
      return `<div class="node map-node">
        <div class="node-header">
          ${options?.prepend ?? ''}
          <label>${options?.label ?? path.locale()}</label>
          ${options?.inject ?? ''}
          ${keys.renderRaw(path, view)}
          <button class="add" data-id="${onAdd}"></button>
        </div>
        <div class="node-body">
          ${Object.keys(value ?? []).map(key => {
            const removeId = view.registerClick(el => view.model.set(path.push(key), undefined))
            return `<div class="node-entry">
            ${children.render(path.modelPush(key), value[key], view, {
              prepend: `<button class="remove" data-id="${removeId}"></button>`,
              label: key
            })}
          </div>`}).join('')}
        </div>
      </div>`
    },
    suggest: (path, value) => keys
      .suggest(path, value)
      .map(quoteString),
    validate(path, value, errors, options) {
      if (options.loose && typeof value !== 'object') {
        value = {}
      }
      if (value === null || typeof value !== 'object') {
        errors.add(path, 'error.expected_object')
        return value
      }
      let res: any = {}
      Object.keys(value).forEach(k => {
        keys.validate(path, k, errors, options)
        res[k] = children.validate(path.push(k), value[k], errors, options)
      })
      return res
    },
    validationOption(value) {
      return config?.validation ?? keys.validationOption(value)
    }
  }
}
