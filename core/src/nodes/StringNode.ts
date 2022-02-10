import { INode, Base } from './Node'
import { Registry } from '../Registries'
import { ValidationOption } from '../ValidationOption'
import { quoteString } from '../utils'
import { DataModel } from '../model/DataModel'

export type EnumOption = {
  enum: string | string[]
  additional?: boolean
}

const isEnum = (value?: ValidationOption | EnumOption): value is EnumOption => {
  return !!(value as any)?.enum
}

const isValidator = (value?: ValidationOption | EnumOption): value is ValidationOption => {
  return !!(value as any)?.validator
}

export type StringHookParams = {
  getValues: () => string[],
  config?: ValidationOption | EnumOption
}

/**
 * Simple string node with one text field
 */
export const StringNode = (collections?: Registry<string[]>, config?: ValidationOption | EnumOption): INode<string> => {
  const getValues = () => {
    if (isEnum(config)) {
      if (typeof config.enum === 'string') {
        return collections?.get(config.enum as string) ?? []
      }
      return config.enum
    }
    if (config?.validator === 'resource') {
      if (typeof config.params.pool === 'string') {
        if (config.params.requireTag) {
          return collections?.get(`tag/${config.params.pool}`).map(e => `#${e}`) ?? []
        }
        const registry = config.params.pool.replace(/^\$/, '')
        return [
          ...config.params.allowTag ? collections?.get(`tag/${registry}`).map(e => `#${e}`) ?? [] : [],
          ...collections?.get(registry) ?? [],
        ]
      }
      return config.params.pool
    }
    return []
  }

  return {
    ...Base,
    type: () => 'string',
    default: () => '',
    validate(path, value, errors, options) {
      if (options.loose && typeof value !== 'string') {
        value = (options.wrapLists ? DataModel.wrapLists(this.default()) : this.default()) || undefined
      }
      if (typeof value !== 'string') {
        errors.add(path, 'error.expected_string')
        return value
      }
      if (isValidator(config)) {
        if (config.validator === 'resource' && value.length > 0 && !value.includes(':')) {
          value = value.startsWith('#') 
            ? '#minecraft:' + value.slice(1)
            : 'minecraft:' + value
        }
        if (config.validator === 'resource' && typeof value == 'string') {
          let id = value
          if (value.startsWith('#')) {
            if (typeof config.params.pool === 'string' && config.params.pool.startsWith('$tag/')) {
              errors.add(path, 'error.disallowed_tag_prefix')
              return value
            } else if (!config.params.allowTag && !config.params.requireTag) {
              errors.add(path, 'error.disallowed_tag')
              return value
            }
            id = id.slice(1)
          } else if (config.params.requireTag) {
            errors.add(path, 'error.expected_tag')
            return value
          }
          if (!id.match(/^(?:[_\-a-z0-9.]*:)?[_\-a-z0-9/.]*$/g)) {
            errors.add(path, 'error.invalid_resource_location')
            return value
          }
        }
        if (config.validator === 'resource' && (
          (typeof config.params.pool === 'string' && config.params.pool.startsWith('$')) ||
          ((config.params.allowTag || config.params.requireTag) && value.startsWith('#')) ||
          config.params.isDefinition || 
          config.params.allowUnknown
        )) {
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
    validationOption() {
      return isValidator(config) ? config : undefined
    },
    hook(hook, path, ...args) {
      return ((hook.string ?? hook.base) as any).call(hook, { node: this, getValues, config }, path, ...args)
    }
  }
}
