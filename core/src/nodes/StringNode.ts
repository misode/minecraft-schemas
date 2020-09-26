import { INode, Base } from './Node'
import { locale, CollectionRegistry } from '../Registries'
import { ValidationOption } from '../ValidationOption'
import { ModelPath, Path } from '../model/Path'
import { Mounter } from '../Mounter'
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
        ? (config.params.pool.startsWith('$')
          ? () => collections?.get((config.params.pool as string).slice(1)) ?? []
          : () => collections?.get(config.params.pool as string) ?? [])
        : () => config.params.pool as string[])
      : () => [])

  return {
    ...Base,
    type: () => 'string',
    default: () => '',
    render(path, value, mounter) {
      const inputId = mounter.register(el => {
        (el as HTMLSelectElement).value = value ?? ''
        el.addEventListener('change', evt => {
          const newValue = (el as HTMLSelectElement).value
          path.model.set(path, newValue.length === 0 ? undefined : newValue)
          evt.stopPropagation()
        })
      })
      return ['', this.renderRaw(path, mounter, inputId), '']
    },
    validate(path, value, errors, options) {
      if (options.loose && typeof value !== 'string') {
        value = this.default() || undefined
      }
      if (typeof value !== 'string') {
        errors.add(path, 'error.expected_string')
        return value
      }
      if (isValidator(config)) {
        if (config.validator === 'resource' && value.length > 0 && !value.includes(':')) {
          value = 'minecraft:' + value
        }
        if (config.validator === 'resource' && typeof config.params.pool === 'string' && config.params.pool.startsWith('$')) {
          return value
        }
      }
      if ((isEnum(config) && config.additional)) {
        return value
      }
      const values = getValues()
      if (values.length > 0 && !values.includes(value)) {
        errors.add(path, 'error.invalid_enum_option', value)
      }
      return value
    },
    suggest: () => getValues().map(quoteString),
    getState(el: HTMLElement) {
      return (el.getElementsByTagName('input')[0] ?? el.getElementsByTagName('select')[0]).value
    },
    validationOption() {
      return isValidator(config) ? config : undefined
    },
    renderRaw(path: ModelPath, mounter: Mounter, inputId?: string) {
      const values = getValues()
      if (isEnum(config) && !config.additional) {
        const contextPath = typeof config.enum === 'string' ?
          new Path(path.getArray(), [config.enum]) : path
        return this.renderSelect(contextPath, values, inputId)
      }
      if (config && isValidator(config)
          && config.validator === 'resource'
          && typeof config.params.pool === 'string'
          && values.length > 0) {
        const contextPath = new Path(path.getArray(), [config.params.pool])
        if (contextPath.localePush(values[0]).strictLocale()) {
          return this.renderSelect(contextPath, values, inputId)
        }
      }
      const datalistId = hexId()
      return `<input data-id="${inputId}" ${values.length === 0 ? '' : `list="${datalistId}"`}>
      ${values.length === 0 ? '' :
        `<datalist id="${datalistId}">
        ${values.map(v =>
          `<option value="${v}">`
        ).join('')}
      </datalist>`}`
    },
    renderSelect(contextPath: Path, values: string[], inputId: string) {
      return `<select data-id="${inputId}">
        ${this.optional() ? `<option value="">${locale('unset')}</option>` : ''}
        ${values.map(v =>
          `<option value="${v}">${contextPath.localePush(v).locale()}</option>`
        ).join('')}
      </select>`
    }
  }
}
