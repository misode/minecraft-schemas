import { INode, Base } from './Node'
import { ValidationOption } from '../ValidationOption'

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
    validate(path, value, errors, options) {
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
    validationOption() {
      return config?.validation
    }
  }
}
