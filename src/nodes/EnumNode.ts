import { AbstractNode, NodeMods, RenderOptions, StringLikeNode } from './AbstractNode'
import { DataModel } from '../model/DataModel'
import { TreeView } from '../view/TreeView'
import { Path } from '../model/Path'
import { locale } from '../Registries'
import { Errors } from '../model/Errors'

/**
 * Enum node that shows a list of options to choose from
 */
export class EnumNode extends AbstractNode<string> implements StringLikeNode {
  protected options: string[]
  static className = 'enum-node'

  /**
   * @param options options to choose from in the select
   * @param mods optional node modifiers or a string to be the default value
   */
  constructor(options: string[], mods?: NodeMods<string> | string) {
    super(typeof mods === 'string' ? {
        default: () => mods,
        force: () => true
      } : mods)
    this.options = options
  }

  getState(el: Element) {
    return el.querySelector('select')!.value
  }

  render(path: Path, value: string, view: TreeView, options?: RenderOptions) {
    const selectId = view.register(el => {
      (el as HTMLInputElement).value = value
      el.addEventListener('change', evt => {
        view.model.set(path, (el as HTMLInputElement).value)
        evt.stopPropagation()
      })
    })
    return `<div class="node enum-node node-header">
      ${options?.removeId ? `<button class="remove" data-id="${options?.removeId}"></button>` : ``}
      ${options?.hideLabel ? `` : `<label>${locale(path)}</label>`}
      <select data-id=${selectId}>
        ${this.options.map(o => 
          `<option value="${o}">${locale(path.push(o))}</option>`
        ).join('')}
      </select>
    </div>`
  }

  renderRaw(path: Path) {
    return `<select>
      ${this.options.map(o => 
        `<option value="${o}">${locale(path.push(o))}</option>`
      ).join('')}
    </select>`
  }

  validate(path: Path, value: any, errors: Errors) {
    if (typeof value !== 'string') {
      return errors.add(path, 'error.expected_string')
    }
    if (!this.options.includes(value)) {
      return errors.add(path, 'error.invalid_enum_option')
    }
    return true
  }
}
