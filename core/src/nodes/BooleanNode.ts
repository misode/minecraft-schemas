import { INode, Base } from './Node'
import { Hook } from '../Hook'

export type BooleanHookParams = {}

/**
 * Boolean node with two buttons for true/false
 */
export const BooleanNode = (): INode<boolean> => {
  return {
    ...Base,
    type: () => 'boolean',
    default: () => false,
    suggest: () => ['false', 'true'],
    validate(path, value, errors, options) {
      if (options.loose && typeof value !== 'boolean') {
        value = this.default()
      }
      if (typeof value !== 'boolean' || value === undefined) {
        errors.add(path, 'error.expected_boolean')
      }
      return value
    },
    hook<U extends any[], V>(hook: Hook<U, V>, ...args: U) {
      return hook.boolean({ node: this}, ...args)
    }
  }
}
