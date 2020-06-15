import { INode, Base } from './Node'
import { locale } from '../Registries'

type NumberNodeConfig = {
  /** Whether only integers are allowed */
  integer?: boolean
  /** If specified, number will be capped at this minimum */
  min?: number
  /** If specified, number will be capped at this maximum */
  max?: number
}

export const NumberNode = (config?: NumberNodeConfig): INode<number> => {
  const integer = config?.integer ?? false
  const min = config?.min ?? -Infinity
  const max = config?.max ?? Infinity

  return {
    ...Base,
    default: () => 0,
    render(path, value, view, options) {
      const onChange = view.registerChange(el => {
        const value = (el as HTMLInputElement).value
        let parsed = integer ? parseInt(value) : parseFloat(value)
        if (parsed < min) parsed = min
        if (parsed > max) parsed = max
        view.model.set(path, parsed)
      })
      return `<div class="node number-node node-header">
        ${options?.removeId ? `<button class="remove" data-id="${options?.removeId}"></button>` : ``}
        ${options?.hideLabel ? `` : `<label>${locale(path)}</label>`}
        <input data-id="${onChange}" value="${value ?? ''}">
      </div>`
    },
    validate(path, value, errors) {
      if (typeof value !== 'number') {
        errors.add(path, 'error.expected_number')
      }
      if (integer && !Number.isInteger(value)) {
        errors.add(path, 'error.expected_integer')
      }
      if (value < min) {
        errors.add(path, 'error.invalid_range.smaller', value, min)
      }
      if (value > max) {
        errors.add(path, 'error.invalid_range.larger', value, max)
      }
      return value
    }
  }
}
