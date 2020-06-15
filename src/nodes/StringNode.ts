import { INode, Base, RenderOptions } from './Node'
import { Path } from '../model/Path'
import { locale } from '../Registries'

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
      return `<div class="node string-node node-header">
        ${options?.removeId ? `<button class="remove" data-id="${options?.removeId}"></button>` : ``}
        ${options?.hideLabel ? `` : `<label>${locale(path)}</label>`}
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
    renderRaw(path: Path) {
      return `<input>`
    }
  }
}
