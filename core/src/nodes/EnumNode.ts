import { INode, Base } from './Node'
import { Path, ModelPath } from '../model/Path'
import { COLLECTIONS, locale } from '../Registries'
import { TreeView } from '../view/TreeView'
import { ValidationOption } from '../ValidationOption'
import { quoteString, hexId } from '../utils'

type EnumNodeConfig = {
  /** The default value */
  defaultValue?: string,
  /** If true, a \<datalist> will be used and options won't be translated */
  search?: boolean
  /** If true, values not in the list are also permitted */
  additional?: boolean,
  /** Options for value validation. */
  validation?: ValidationOption
}

/**
 * @param config `string` to represent the default value.
 */
export const EnumNode = (values: string[] | string, config?: string | EnumNodeConfig): INode<string> => {
  const getValues = (typeof values === 'string') ?
    () => COLLECTIONS.get(values) :
    () => values
  const defaultValue = (typeof config === 'string') ? config : config?.defaultValue
  const search = (typeof config === 'string') ? undefined : config?.search
  const additional = (typeof config === 'string') ? undefined : config?.additional
  const validation = (typeof config === 'string') ? undefined : config?.validation

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
        ${options?.prepend ?? ''}
        <label>${options?.label ?? path.locale()}</label>
        ${options?.inject ?? ''}
        ${this.renderRaw(path, view, inputId)}
      </div>`
    },
    validate(path, value, errors, options) {
      if (options.loose && value === undefined && defaultValue !== undefined) {
        return defaultValue
      }
      if (typeof value !== 'string') {
        errors.add(path, 'error.expected_string')
      } else if (!additional && !getValues().includes(value)) {
        errors.add(path, 'error.invalid_enum_option', value)
      }
      return value
    },
    renderRaw(path: ModelPath, view: TreeView, inputId?: string) {
      const valuesList = getValues()
      inputId = inputId ?? view.register(el => {
        (el as HTMLSelectElement).value = defaultValue ?? ''
      })
      if (search) {
        const datalistId = hexId()
        return `<input list="${datalistId}" data-id="${inputId}">
        <datalist id="${datalistId}">
          ${valuesList.map(v => 
            `<option value="${v}">`
          ).join('')}
        </datalist>`
      }
      const pathWithContext = (typeof values === 'string') ?
        new ModelPath(path.getModel(), new Path(path.getArray(), [values])) : path
      return `<select data-id="${inputId}">
        ${defaultValue ? `` : `<option value="">${locale('unset')}</option>`}
        ${valuesList.map(v =>
          `<option value="${v}">${pathWithContext.push(v).locale()}</option>`
        ).join('')}
      </select>`
    },
    suggest: () => getValues().map(quoteString),
    getState(el: Element) {
      return el.getElementsByTagName(search ? 'input' : 'select')[0].value
    },
    validationOption() {
      return validation
    }
  }
}
