import { NodeMods, RenderOptions } from '../../nodes/AbstractNode'
import { EnumNode } from '../../nodes/EnumNode'
import { Path } from '../../model/Path'
import { TreeView, getId } from '../../view/TreeView'
import { locale } from '../../Registries'

export interface ResourceNodeMods extends NodeMods<string> {
  additional?: boolean
}

export class ResourceNode extends EnumNode {
  additional: boolean

  constructor(options: string[], mods?: ResourceNodeMods) {
    super(options, {
      transform: (v) => {
        if (v === undefined || v.length === 0) return undefined
        return v.startsWith('minecraft:') ? v : 'minecraft:' + v
      }, ...mods})
    this.additional = mods?.additional ?? false
  }

  getState(el: Element) {
    if (this.additional) {
      return el.querySelector('input')!.value
    } else {
      return super.getState(el)
    }
  }

  render(path: Path, value: string, view: TreeView, options?: RenderOptions) {
    if (this.additional) {
      const inputId = view.register(el => {
        (el as HTMLInputElement).value = value ?? ''
        el.addEventListener('change', evt => {
          view.model.set(path, this.getState(el))
          evt.stopPropagation()
        })
      })
      const id = `datalist-${getId()}`
      return `${options?.hideLabel ? `` : `<label>${locale(path)}</label>`}
      <input list=${id} data-id="${inputId}" value="${value ?? ''}">
      <datalist id=${id}>${this.options.map(o => 
        `<option value="${o}">${locale(path.push(o))}</option>`
      ).join('')}</datalist>`
    } else {
      return super.render(path, value, view, options)
    }
  }
}
