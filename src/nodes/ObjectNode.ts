import { NodeMods, INode, NodeChildren, AbstractNode, RenderOptions } from './AbstractNode'
import { Path } from '../model/Path'
import { TreeView } from '../view/TreeView'
import { locale } from '../Registries'
import { SourceView } from '../view/SourceView'
import { DataModel } from '../model/DataModel'
import { Errors } from '../model/Errors'

export const Switch = Symbol('switch')
export const Case = Symbol('case')

export type NestedNodeChildren = {
  [name: string]: NodeChildren
}

export type IObject = {
  [name: string]: any
}

export type FilteredChildren = {
  [name: string]: INode<any>
  /** The field to filter on */
  [Switch]?: (path: Path) => any
  /** Map of filter values to node fields */
  [Case]?: NestedNodeChildren
}

export interface ObjectNodeMods extends NodeMods<object> {
  /** Whether the object can be collapsed. Necessary when recursively nesting. */
  collapse?: boolean
}

/**
 * Object node containing fields with different types.
 * Has the ability to filter fields based on a switch field.
 */
export class ObjectNode extends AbstractNode<IObject> {
  fields: NodeChildren
  cases: NestedNodeChildren
  filter?: (path: Path) => any
  collapse?: boolean

  /**
   * @param fields children containing the optional switch and case
   * @param mods optional node modifiers
   */
  constructor(fields: FilteredChildren, mods?: ObjectNodeMods) {
    super({
      default: () => ({}),
      ...mods})
    this.collapse = mods?.collapse ?? false
    const {[Switch]: _switch, [Case]: _case, ..._fields} = fields
    this.fields = _fields
    this.cases = _case ?? {}
    this.filter = _switch
  }

  transform(path: Path, value: IObject, view: SourceView) {
    if (value === undefined) return undefined
    const activeFields = this.getActiveFields(path, view.model)
    let res: any = {}
    Object.keys(activeFields).forEach(f => {
      return res[f] = activeFields[f].transform(path.push(f), value[f], view)
    })
    return this.transformMod(res);
  }

  render(path: Path, value: IObject, view: TreeView, options?: RenderOptions) {
    if (options?.hideLabel) {
      return this.renderFields(path, value, view)
    } else if (this.collapse || options?.collapse) {
      if (value === undefined) {
        const id = view.registerClick(() => view.model.set(path, this.default()))
        return `<div class="node object-node">
          <label class="collapse closed" data-id="${id}">${locale(path)}</label>
        </div>`
      } else {
        const id = view.registerClick(() => view.model.set(path, undefined))
        return `<div class="node object-node">
          <label class="collapse open" data-id="${id}">${locale(path)}</label>
          <div class="object-fields">
            ${this.renderFields(path, value, view)}
          </div>
        </div>`
      }
    } else {
      return `<div class="node object-node">
        <label>${locale(path)}</label>
        <div class="object-fields">
          ${this.renderFields(path, value, view)}
        </div>
      </div>`
    }
  }

  renderFields(path: Path, value: IObject, view: TreeView) {
    value = value ?? {}
    const activeFields = this.getActiveFields(path,view.model)
    return Object.keys(activeFields).map(f => {
      if (!activeFields[f].enabled(path.push(f), view.model)) return ''
      return activeFields[f].render(path.push(f), value[f], view)
    }).join('')
  }

  getActiveFields(path: Path, model: DataModel) {
    if (this.filter === undefined) return this.fields 
    const switchValue = this.filter(path.withModel(model))
    const activeCase = this.cases[switchValue]
    return {...this.fields, ...activeCase}
  }

  validate(path: Path, value: any, errors: Errors) {
    if (value === null || typeof value !== 'object') {
      return errors.add(path, 'error.expected_object')
    }
    const activeFields = this.getActiveFields(path, path.getModel()!)
    const activeKeys = Object.keys(activeFields)
    let allValid = true
    Object.keys(value).forEach(k => {
      if (!activeKeys.includes(k)) {
        if (this.filter) {
          const switchValue = this.filter(path)
          errors.add(path.push(k), 'error.invalid_filtered_key', k, switchValue)
        } else {
          errors.add(path.push(k), 'error.invalid_key', k)
        }
        allValid = false
      } else if (!activeFields[k].validate(path.push(k), value[k], errors)) {
        allValid = false
      }
    })
    return allValid
  }
}
