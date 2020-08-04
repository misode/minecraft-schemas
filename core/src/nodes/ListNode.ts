import { INode, Base } from './Node'

export const ListNode = (children: INode): INode<any[]> => {
  return ({
    ...Base,
    default: () => [],
    navigate(path, index, value) {
      const nextIndex = index + 1
      const pathElements = path.getArray()
      if (pathElements.length <= nextIndex) {
        return this
      }
      return children.navigate(path, nextIndex, value ? value[pathElements[nextIndex]] : undefined)
    },
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
        <div class="node-header" ${path.error()} ${path.help()}>
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
              label: path.localePush('entry').locale([`${index}`])
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
      return value.map((obj, index) =>
        children.validate(path.push(index), obj, errors, options)
      )
    }
  })
}
