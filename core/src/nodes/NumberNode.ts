import { INode, Base } from './Node'

type NumberNodeConfig = {
  /** Whether only integers are allowed */
  integer?: boolean
  /** If specified, number will be capped at this minimum */
  min?: number
  /** If specified, number will be capped at this maximum */
  max?: number,
  /** Whether the number represents a color */
  color?: boolean
}

export const NumberNode = (config?: NumberNodeConfig): INode<number> => {
  const integer = config?.color ? true : config?.integer ?? false
  const min = config?.color ? 0 : config?.min ?? -Infinity
  const max = config?.color ? 16777215 : config?.max ?? Infinity
  const between = config?.min !== undefined && config?.max !== undefined

  return {
    ...Base,
    type: () => 'number',
    default: () => 0,
    render(path, value, mounter) {
      const onChange = mounter.registerChange(el => {
        const value = (el as HTMLInputElement).value
        let parsed = config?.color
          ? parseInt(value.slice(1), 16)
          : integer ? parseInt(value) : parseFloat(value)
          path.model.set(path, parsed)
      })
      if (config?.color) {
        const hex = (value?.toString(16).padStart(6, '0') ?? '000000')
        return ['', `<input type="color" data-id="${onChange}" value="#${hex}">`, '']
      }
      return ['', `<input data-id="${onChange}" value="${value ?? ''}">`, '']
    },
    validate(path, value, errors, options) {
      if (options.loose && typeof value !== 'number') {
        value = this.default()
      }
      if (typeof value !== 'number') {
        errors.add(path, 'error.expected_number')
      } else if (integer && !Number.isInteger(value)) {
        errors.add(path, 'error.expected_integer')
      } else if (between && (value < min || value > max)) {
        errors.add(path, 'error.expected_number_between', min, max)
      } else if (value < min) {
        errors.add(path, 'error.invalid_range.smaller', value, min)
      } else if (value > max) {
        errors.add(path, 'error.invalid_range.larger', value, max)
      }
      return value
    }
  }
}
