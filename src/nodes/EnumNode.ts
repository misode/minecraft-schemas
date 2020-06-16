import { INode, Base } from './Node'
import { Path } from '../model/Path'
import { COLLECTIONS } from '../Registries'

export const EnumNode = (values: string[] | string): INode<string> => {
  const getValues = (typeof values === 'string') ?
    () => COLLECTIONS.get(values) :
    () => values

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
      return `<div class="node enum-node node-header" ${path.error()}>
        ${options?.removeId ? `<button class="remove" data-id="${options?.removeId}"></button>` : ``}
        ${options?.hideLabel ? `` : `<label>${path.locale()}</label>`}
        <select data-id=${select}>
          ${getValues().map(o => 
            `<option value="${o}">${path.push(o).locale()}</option>`
          ).join('')}
        </select>
      </div>`
    },
    validate(path, value, errors) {
      if (typeof value !== 'string') {
        errors.add(path, 'error.expected_string')
      } else if (!getValues().includes(value)) {
        errors.add(path, 'error.invalid_enum_option', value)
      }
      return value
    },
    renderRaw(path: Path) {
      return `<select>
        ${getValues().map(v => 
          `<option value="${v}">${path.push(v).locale()}</option>`
        ).join('')}
      </select>`
    },
    getState(el: Element) {
      return el.getElementsByTagName('select')[0].value
    }
  }
}
