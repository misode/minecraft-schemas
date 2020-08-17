import { INode, Base } from './Node'
import { locale, CollectionRegistry } from '../Registries'
import { ValidationOption } from '../ValidationOption'
import { ModelPath } from '../model/Path'
import { TreeView } from '../view/TreeView'
import { hexId, quoteString } from '../utils'

type EnumOption = {
  enum: string | string[]
  additional?: boolean
}

const isEnum = (value?: ValidationOption | EnumOption): value is EnumOption => {
  return !!(value as any)?.enum
}

const isValidator = (value?: ValidationOption | EnumOption): value is ValidationOption => {
  return !!(value as any)?.validator
}

/**
 * Simple string node with one text field
 */
export const StringNode = (collections?: CollectionRegistry, config?: ValidationOption | EnumOption): INode<string> => {
  const getValues = 
    isEnum(config)
    ? ((typeof config.enum === 'string')
      ? () => collections?.get(config.enum as string) ?? []
      : () => config.enum as string[])
    : ((config?.validator === 'resource')
      ? ((typeof config.params.pool === 'string')
        ? () => collections?.get(config.params.pool as string) ?? []
        : () => config.params.pool as string[])
      : () => [])

  return {
    ...Base,
    default: () => '',
    render(path, value, view, options) {
      const onChange = view.registerChange(el => {
        const value = (el as HTMLInputElement).value
        view.model.set(path, value)
      })
      return `<div class="node string-node node-header" ${path.error()} ${path.help()}>
        ${options?.prepend ?? ''}
        <label>${options?.label ?? path.locale()}</label>
        ${options?.inject ?? ''}
        <input data-id="${onChange}" value="${value ?? ''}">
      </div>`
    },
    validate(path, value, errors) {
      if (typeof value !== 'string') {
        errors.add(path, 'error.expected_string')
        return value
      }
      if (isValidator(config)) {
        if (config.validator === 'resource' && value.length > 0 && !value.includes(':')) {
          value = 'minecraft:' + value
        }
      }
      const values = getValues()
      if (values.length > 0 && !getValues().includes(value)) {
        if (!(isEnum(config) && config.additional)) {
          errors.add(path, 'error.invalid_enum_option', value)
        }
      }
      return value
    },
    suggest: () => getValues().map(quoteString),
    getState(el: HTMLElement) {
      return el.getElementsByTagName('input')[0].value
    },
    validationOption() {
      return isValidator(config) ? config : undefined
    },
    renderRaw() {
      return `<input>`
    }
  }
}
