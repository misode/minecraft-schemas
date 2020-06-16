import { INode, Base } from '../../nodes/Node'

export const JsonNode = (): INode<any> => {
  return {
    ...Base,
    default: () => '',
    render(path, value, view, options) {
      const stringified = (JSON.stringify(value) ?? '').replace(/"/g, '&quot;')
      const onChange = view.registerChange(el => {
        const value = (el as HTMLInputElement).value
        try {
          view.model.set(path, JSON.parse(value))
        } catch (e) {
          view.model.set(path, value || undefined)
        }
      })
      return `<div class="node json-node node-header" ${path.error()}>
        ${options?.removeId ? `<button class="remove" data-id="${options?.removeId}"></button>` : ``}
        ${options?.hideLabel ? `` : `<label>${path.locale()}</label>`}
        <input data-id="${onChange}" value="${stringified ?? ''}">
      </div>`
    }
  }
}
