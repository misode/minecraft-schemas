import { INode, Base } from './Node'
import { locale } from '../Registries'
import { NumberNode } from './NumberNode'

export type IUniformInt = number | { base?: number, spread?: number }

type UniformIntNodeConfig = {
  min?: number
  max?: number
  maxSpread?: number
}

export const UniformIntNode = (config?: UniformIntNodeConfig): INode<IUniformInt> => {
  const baseNode = NumberNode({ integer: true, min: config?.min, max: config?.max })
  const spreadNode = NumberNode({ integer: true, min: 0, max: config?.maxSpread })
  const getState = (el: Element): IUniformInt => {
    const type = el.querySelector('select')!.value
    if (type === 'exact') {
      return Number(el.querySelector('input')?.value || undefined)
    }
    const base = Number(el.querySelectorAll('input')[0]?.value || undefined)
    const spread = Number(el.querySelectorAll('input')[1]?.value || undefined)
    return {
      base: isNaN(base) ? undefined : base,
      spread: isNaN(spread) ? undefined : spread
    }
  }

  return {
    ...Base,
    default: () => 0,
    keep: () => true,
    suggest(_path, value) {
      if (value === undefined || typeof value === 'number') {
        return []
      } else {
        const existingKeys = Object.keys(value)
        return ['base', 'spread'].filter(k => !existingKeys.includes(k))
      }
    },
    navigate(path, index) {
      const nextIndex = index + 1
      const node = UniformIntNode()
      return node.navigate(path, nextIndex)
    },
    render(path, value, view, options) {
      const id = view.registerChange(el => {
        view.model.set(path, getState(el))
      })
      const selectId = view.register(el => {
        (el as HTMLInputElement).value = (value === undefined || typeof value === 'number') ? 'exact' : 'uniform'
        el.addEventListener('change', evt => {
          const target = (el as HTMLInputElement).value
          const newValue = target === 'exact' ? this.default() : {}
          view.model.set(path, newValue)
          evt.stopPropagation()
        })
      })
      return `<div class="node range-node node-header" data-id="${id}" ${path.error(false)}>
        ${options?.prepend ?? ''}
        <label>${options?.label ?? path.locale()}</label>
        ${options?.inject ?? ''}
        <select data-id="${selectId}">
          <option value="exact">${locale('uniform_int.exact')}</option>
          <option value="uniform">${locale('uniform_int.uniform')}</option>
        </select>
        ${value === undefined || typeof value === 'number' ? `
          <input value=${value ?? ''}>
        ` : `
          <label>${locale('uniform_int.base')}</label>
          <input value=${value.base ?? ''}>
          <label>${locale('uniform_int.spread')}</label>
          <input value=${value.spread ?? ''}>
        `}
      </div>`
    },
    validate(path, value, errors, options) {
      if (typeof value !== 'number' && typeof value !== 'object') {
        errors.add(path, 'error.expected_uniform_int')
        return value
      }
      if (value === undefined || typeof value === 'number') {
        baseNode.validate(path, value, errors, options)
      } else {
        if (value.base !== undefined) {
          baseNode.validate(path.push('base'), value.base, errors, options)
        }
        if (value.spread !== undefined) {
          spreadNode.validate(path.push('spread'), value.spread, errors, options)
        }
      }
      return value
    }
  }
}
