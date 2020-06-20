import { INode, Base } from './Node'
import { locale } from '../Registries'

type StringNodeConfig = {
  allowEmpty?: boolean
  pattern?: RegExp,
  patternError?: string
}

/**
 * Simple string node with one text field
 */
export const StringNode = (config?: StringNodeConfig): INode<string> => {
  return {
    ...Base,
    default: () => '',
    render(path, value, view, options) {
      const onChange = view.registerChange(el => {
        const value = (el as HTMLInputElement).value
        view.model.set(path, value)
      })
      return `<div class="node string-node node-header" ${path.error()}>
        ${options?.prepend ?? ''}
        <label>${options?.label ?? path.locale()}</label>
        ${options?.inject ?? ''}
        <input data-id="${onChange}" value="${value ?? ''}">
      </div>`
    },
    validate(path, value, errors, options) {
      if (typeof value !== 'string') {
        errors.add(path, 'error.expected_string')
        return value
      }
      if (!config?.allowEmpty && value.length === 0) {
        if (options.loose) {
          return undefined
        } else {
          errors.add(path, 'error.invalid_empty_string')
        }
      }
      if (config?.pattern && !value.match(config.pattern)) {
        errors.add(path, 'error.invalid_pattern', locale(config.patternError ?? 'pattern'))
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
