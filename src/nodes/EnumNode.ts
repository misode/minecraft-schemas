import { INode, Base } from './Node'
import { Path } from '../model/Path'
import { COLLECTIONS, locale } from '../Registries'
import { getId, TreeView } from '../view/TreeView'

type EnumNodeConfig = {
  /** If true, a <datalist> will be used and options won't be translated */
  search?: boolean
  /** If true, values not in the list are also permitted */
  additional?: boolean
}

export const EnumNode = (values: string[] | string, config?: string | EnumNodeConfig): INode<string> => {
  const getValues = (typeof values === 'string') ?
    () => COLLECTIONS.get(values) :
    () => values
  const defaultValue = (typeof config === 'string') ? config : undefined
  const search = (typeof config === 'string') ? undefined : config?.search
  const additional = (typeof config === 'string') ? undefined : config?.additional

  return {
    ...Base,
    default() {
      return defaultValue ?? ''
    },
    force() {
      return defaultValue !== undefined
    },
    render(path, value, view, options) {
      const inputId = view.register(el => {
        (el as HTMLSelectElement).value = value ?? ''
        el.addEventListener('change', evt => {
          const newValue = (el as HTMLSelectElement).value
          view.model.set(path, newValue.length === 0 ? undefined : newValue)
          evt.stopPropagation()
        })
      })
      return `<div class="node enum-node node-header" ${path.error()}>
        ${options?.removeId ? `<button class="remove" data-id="${options?.removeId}"></button>` : ``}
        ${options?.hideLabel ? `` : `<label>${path.locale()}</label>`}
        ${options?.inject ?? ''}
        ${this.renderRaw(path, view, inputId)}
      </div>`
    },
    validate(path, value, errors) {
      if (value === undefined && defaultValue !== undefined) {
        return defaultValue
      }
      if (typeof value !== 'string') {
        errors.add(path, 'error.expected_string')
      } else if (!additional && !getValues().includes(value)) {
        errors.add(path, 'error.invalid_enum_option', value)
      }
      return value
    },
    renderRaw(path: Path, view: TreeView, inputId?: string) {
      const values = getValues()
      inputId = inputId ?? view.register(el => {
        (el as HTMLSelectElement).value = defaultValue ?? ''
      })
      if (search) {
        const datalistId = getId()
        return `<input list="${datalistId}" data-id="${inputId}">
        <datalist id="${datalistId}">
          ${values.map(v => 
            `<option value="${v}">`
          ).join('')}
        </datalist>`
      }
      return `<select data-id="${inputId}">
        ${defaultValue ? `` : `<option value="">${locale('unset')}</option>`}
        ${values.map(v =>
          `<option value="${v}">${path.push(v).locale()}</option>`
        ).join('')}
      </select>`
    },
    getState(el: Element) {
      return el.getElementsByTagName(search ? 'input' : 'select')[0].value
    }
  }
}
