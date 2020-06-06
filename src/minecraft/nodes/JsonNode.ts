import { NodeMods, RenderOptions, AbstractNode } from '../../nodes/AbstractNode'
import { Path } from '../../model/Path'
import { TreeView } from '../../view/TreeView'
import { locale } from '../../Registries'
import { DataModel } from '../../model/DataModel'

export class JsonNode extends AbstractNode<any> {
  constructor(mods?: NodeMods<any>) {
    super(mods)
  }

  render(path: Path, value: any, view: TreeView, options?: RenderOptions) {
    const stringified = (JSON.stringify(value) ?? '').replace(/"/g, '&quot;')
    const id = view.registerChange(el => {
      const value = (el as HTMLInputElement).value
      try {
        view.model.set(path, JSON.parse(value))
      } catch (e) {
        view.model.set(path, value || undefined)
      }
    })
    return `<div class="node json-node node-header">
      ${options?.hideLabel ? `` : `<label>${locale(path)}</label>`}
      <input data-id="${id}" value="${stringified ?? ''}">
    </div>`
  }
}
