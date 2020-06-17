import { INode, Base } from './Node'

/**
 * Simple string node with one text field
 */
export const StringNode = (): INode<string> => {
  return {
    ...Base,
    default: () => '',
    render(path, value, view, options) {
      const onChange = view.registerChange(el => {
        const value = (el as HTMLInputElement).value
        view.model.set(path, value)
      })
      return `<div class="node string-node node-header" ${path.error()}>
        ${options?.removeId ? `<button class="remove" data-id="${options?.removeId}"></button>` : ``}
        ${options?.hideLabel ? `` : `<label>${path.locale()}</label>`}
        ${options?.inject ?? ''}
        <input data-id="${onChange}" value="${value ?? ''}">
      </div>`
    },
    validate(path, value, errors) {
      if (typeof value !== 'string') {
        errors.add(path, 'error.expected_string')
      }
      return value
    },
    getState(el: HTMLElement) {
      return el.getElementsByTagName('input')[0].value
    },
    renderRaw() {
      return `<input>`
    }
  }
}
