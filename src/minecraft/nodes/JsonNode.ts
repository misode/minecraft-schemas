import { NodeMods, RenderOptions, AbstractNode } from '../../nodes/AbstractNode'
import { Path } from '../../model/Path'
import { TreeView } from '../../view/TreeView'
import { locale } from '../../Registries'
import { DataModel } from '../../model/DataModel'

export class JsonNode extends AbstractNode<any> {
  constructor(mods?: NodeMods<any>) {
    super(mods)
  }

  updateModel(el: Element, path: Path, model: DataModel) {
    const value = el.querySelector('input')!.value
    try {
      model.set(path, JSON.parse(value))
    } catch (e) {
      model.set(path, value || undefined)
    }
  }

  renderRaw(path: Path, value: any, view: TreeView, options?: RenderOptions) {
    const stringified = (JSON.stringify(value) ?? '').replace(/"/g, '&quot;')
    return `${options?.hideLabel ? `` : `<label>${locale(path)}</label>`}
      <input value="${stringified ?? ''}">`
  }

  getClassName() {
    return 'json-node'
  }
}
