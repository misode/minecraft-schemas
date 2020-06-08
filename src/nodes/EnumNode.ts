import { INode, Base } from './Node'
import { Path } from '../model/Path'
import { locale } from '../Registries'

export const EnumNode = (values: string[]): INode<string> => {

  return {
    ...Base,
    render(path, value, view, options) {
      const select = view.register(el => {
        (el as HTMLSelectElement).value = value
        el.addEventListener('change', evt => {
          view.model.set(path, (el as HTMLSelectElement).value)
          evt.stopPropagation()
        })
      })
      return `<div class="node enum-node node-header">
        ${options?.removeId ? `<button class="remove" data-id="${options?.removeId}"></button>` : ``}
        ${options?.hideLabel ? `` : `<label>${locale(path)}</label>`}
        <select data-id=${select}>
          ${values.map(o => 
            `<option value="${o}">${locale(path.push(o))}</option>`
          ).join('')}
        </select>
      </div>`
    },
    validate(path, value, errors) {
      if (typeof value !== 'string') {
        return errors.add(path, 'error.expected_string')
      }
      if (!values.includes(value)) {
        return errors.add(path, 'error.invalid_enum_option', value)
      }
      return true
    },
    renderRaw(path: Path) {
      return `<select>
        ${values.map(v => 
          `<option value="${v}">${locale(path.push(v))}</option>`
        ).join('')}
      </select>`
    },
    getState(el: Element) {
      return el.getElementsByTagName('select')[0].value
    }
  }
}
