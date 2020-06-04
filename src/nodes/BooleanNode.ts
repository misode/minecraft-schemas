import { AbstractNode, NodeMods, RenderOptions } from './AbstractNode';
import { Path } from '../model/Path';
import { TreeView } from '../view/TreeView';
import { locale } from '../Registries';
import { Errors } from '../model/Errors';

/**
 * Boolean node with two buttons for true/false
 */
export class BooleanNode extends AbstractNode<boolean> {

  /**
   * @param mods optional node modifiers
   */
  constructor(mods?: NodeMods<boolean>) {
    super({
      default: () => false,
      ...mods})
  }

  render(path: Path, value: boolean, view: TreeView, options?: RenderOptions) {
    const falseButton = view.registerClick(el => {
      view.model.set(path, !this.force() && value === false ? undefined : false)
    })
    const trueButton = view.registerClick(el => {
      view.model.set(path, !this.force() && value === true ? undefined : true)
    })
    return `<div class="node boolean-node">
      ${options?.hideLabel ? `` : `<label>${locale(path)}</label>`}
      <button${value === false ? ' style="font-weight: bold"' : ' '} 
        data-id="${falseButton}">${locale('false')}</button>
      <button${value === true ? ' style="font-weight: bold"' : ' '} 
        data-id="${trueButton}">${locale('true')}</button>
    </div>`
  }

  validate(path: Path, value: any, errors: Errors) {
    if (typeof value !== 'boolean' || value === undefined) {
      return errors.add(path, 'error.expected_boolean')
    }
    return true
  }
}
