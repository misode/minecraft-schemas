import { AbstractNode, NodeMods, RenderOptions } from './AbstractNode'
import { Path } from '../model/Path'
import { DataModel } from '../model/DataModel'
import { TreeView } from '../view/TreeView'
import { locale } from '../Registries'
import { Errors } from '../model/Errors'

export interface NumberNodeMods extends NodeMods<number> {
  /** Whether numbers should be converted to integers on input */
  integer?: boolean
  /** If specified, number will be capped at this minimum */
  min?: number
  /** If specified, number will be capped at this maximum */
  max?: number
}

/**
 * Configurable number node with one text field
 */
export class NumberNode extends AbstractNode<number> {
  integer: boolean
  min: number
  max: number

  /**
   * @param mods optional node modifiers
   */
  constructor(mods?: NumberNodeMods) {
    super({
      default: () => 0,
      ...mods})
    this.integer = mods?.integer ?? false
    this.min = mods?.min ?? -Infinity
    this.max = mods?.max ?? Infinity
  }

  getState(el: Element) {
    const value = (el as HTMLInputElement).value
    const parsed = this.integer ? parseInt(value) : parseFloat(value)
    if (parsed < this.min) return this.min
    if (parsed > this.max) return this.max
    return parsed
  }

  render(path: Path, value: number, view: TreeView, options?: RenderOptions) {
    const id = view.registerChange(el => {
      view.model.set(path, this.getState(el))
    })
    return `<div class="node number-node node-header">
      ${options?.removeId ? `<button class="remove" data-id="${options?.removeId}"></button>` : ``}
      ${options?.hideLabel ? `` : `<label>${locale(path)}</label>`}
      <input data-id="${id}" value="${value ?? ''}">
    </div>`
  }

  validate(path: Path, value: any, errors: Errors) {
    if (typeof value !== 'number') {
      return errors.add(path, 'error.expected_number')
    }
    if (this.integer && !Number.isInteger(value)) {
      return errors.add(path, 'error.expected_integer')
    }
    if (value < this.min) {
      return errors.add(path, 'error.invalid_range.smaller', value, this.min)
    }
    if (value > this.max) {
      return errors.add(path, 'error.invalid_range.larger', value, this.max)
    }
    return true
  }
}
