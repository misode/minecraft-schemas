import { INode, Base } from './Node'

type ListNodeConfig = {
  allowEmpty?: boolean
}

export const ListNode = (children: INode, config?: ListNodeConfig): INode<any[]> => {
  return ({
    ...Base,
    transform(path, value, view) {
      if (!(value instanceof Array)) return value
      return value.map((obj, index) => 
        children.transform(path.push(index), obj, view)
      )
    },
    render(path, value, view, options) {
      value = value ?? []
      const onAdd = view.registerClick(el => {
        if (!(value instanceof Array)) value = []
        view.model.set(path, [...value, children.default()])
      })
      return `<div class="node list-node">
        <div class="node-header" ${path.error()}>
          ${options?.prepend ?? ''}
          <label>${options?.label ?? path.locale()}</label>
          ${options?.inject ?? ''}
          <button class="add" data-id="${onAdd}"></button>
        </div>
        ${!(value instanceof Array) ? `` :
          `<div class="node-body">
          ${(value ?? []).map((obj, index) => {
            const removeId = view.registerClick(el => view.model.set(path.push(index), undefined))
            return `<div class="node-entry">
            ${children.render(path.push(index).localePush('entry'), obj, view, {
              prepend: `<button class="remove" data-id="${removeId}"></button>`,
              label: path.localePush('entry').locale()
            })}
          </div>`
          }).join('')}
        </div>`}
      </div>`
    },
    validate(path, value, errors, options) {
      if (options.loose && value === undefined) {
        return []
      }
      if (!(value instanceof Array)) {
        errors.add(path, 'error.expected_list')
        return value
      }
      if (!config?.allowEmpty && value.length === 0) {
        if (options.loose) {
          return undefined
        } else {
          errors.add(path, 'error.invalid_empty_list')
        }
      }
      return value.map((obj, index) =>
        children.validate(path.push(index), obj, errors, options)
      )
    }
  })
}
