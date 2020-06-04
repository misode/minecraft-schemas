import { AbstractNode, NodeMods, INode, StateNode } from './AbstractNode'
import { TreeView } from '../view/TreeView'
import { Path } from '../model/Path'
import { IObject } from './ObjectNode'
import { locale } from '../Registries'
import { SourceView } from '../view/SourceView'
import { Errors } from '../model/Errors'

export type IMap = {
  [name: string]: IObject
}

/**
 * Map nodes similar to list nodes, but a string key is required to add children
 */
export class MapNode extends AbstractNode<IMap> {
  protected keys: StateNode<string>
  protected values: INode<any>

  /**
   * 
   * @param keys node used for the string key
   * @param values node used for the map values
   * @param mods optional node modifiers
   */
  constructor(keys: StateNode<string>, values: INode<any>, mods?: NodeMods<IMap>) {
    super({
      default: () => ({}),
      ...mods})
    this.keys = keys
    this.values = values
  }

  transform(path: Path, value: IMap, view: SourceView) {
    if (value === undefined) return undefined
    let res: any = {}
    Object.keys(value).forEach(f =>
      res[f] = this.values.transform(path.push(f), value[f], view)
    )
    return this.transformMod(res);
  }

  render(path: Path, value: IMap, view: TreeView) {
    value = value ?? []
    const button = view.registerClick(el => {
      const key = this.keys.getState(el.parentElement!)
      view.model.set(path.push(key), this.values.default())
    })
    return `<div class="node map-node">
      <label>${locale(path)}:</label>
      ${this.keys.render(path, '', view, {hideLabel: true, syncModel: false})}
      <button data-id="${button}">${locale('add')}</button>
      <div class="map-fields">
        ${Object.keys(value).map(key => {
          return this.renderEntry(path.push(key), value[key], view)
        }).join('')}
      </div>
    </div>`
  }

  private renderEntry(path: Path, value: IObject, view: TreeView) {
    const button = view.registerClick(el => {
      view.model.set(path, undefined)
    })
    return `<div class="map-entry"><button data-id="${button}">${locale('remove')}</button>
      ${this.values.render(path, value, view)}
    </div>`
  }

  validate(path: Path, value: any, errors: Errors) {
    if (value === null || typeof value !== 'object') {
      return errors.add(path, 'error.expected_object')
    }
    let allValid = true
    Object.keys(value).forEach(k => {
      if (!this.keys.validate(path, k, errors)) {
        allValid = false
      }
      if (!this.values.validate(path.push(k), value[k], errors)) {
        allValid = false
      }
    })
    return allValid
  }
}
