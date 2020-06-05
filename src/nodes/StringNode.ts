import { AbstractNode, NodeMods, RenderOptions, StringLikeNode } from './AbstractNode'
import { Path } from '../model/Path'
import { DataModel } from '../model/DataModel'
import { TreeView } from '../view/TreeView'
import { locale } from '../Registries'
import { Errors } from '../model/Errors'

export interface StringNodeMods extends NodeMods<string> {
  /** Whether the string can also be empty */
  allowEmpty?: boolean
}

/**
 * Simple string node with one text field
 */
export class StringNode extends AbstractNode<string> implements StringLikeNode {
  allowEmpty: boolean

  /**
   * @param mods optional node modifiers
   */
  constructor(mods?: StringNodeMods) {
    super(mods)
    this.allowEmpty = mods?.allowEmpty ?? false
  }

  getState(el: Element) {
    return el.querySelector('input')!.value
  }

  render(path: Path, value: string, view: TreeView, options?: RenderOptions) {
    const id = view.registerChange(el => {
      const value = (el as HTMLInputElement).value
      view.model.set(path, this.allowEmpty || value !== '' ? value : undefined)
    })
    return `<div clas="node string-node">
      ${options?.hideLabel ? `` : `<label>${locale(path)}</label>`}
      <input data-id="${id}" value="${value ?? ''}">
    </div>`
  }

  renderRaw() {
    return `<input>`
  }

  validate(path: Path, value: any, errors: Errors) {
    if (typeof value !== 'string') {
      return errors.add(path, 'error.expected_string')
    }
    return true
  }
} 
