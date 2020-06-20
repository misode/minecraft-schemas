import { INode, Base } from '../../nodes/Node'
import { locale } from '../../Registries'
import { NumberNode } from '../../nodes/NumberNode'

export type IRange = number
  | { min?: number, max?: number, type?: 'uniform' }
  | { n?: number, p?: number, type: 'binomial' }

type RangeNodeConfig = {
  /** Whether only integers are allowed */
  integer?: boolean
  /** If specified, number will be capped at this minimum */
  min?: number
  /** If specified, number will be capped at this maximum */
  max?: number
  /** Whether binomials are allowed */
  allowBinomial?: boolean
  /** If true, only ranges are allowed */
  forceRange?: boolean
}

export const RangeNode = (config?: RangeNodeConfig): INode<IRange> => {
  const numberNode = NumberNode(config)
  const getState = (el: Element): IRange => {
    const type = (config?.forceRange) ? 'range' : el.querySelector('select')!.value
    if (type === 'exact') {
      return Number(el.querySelector('input')?.value || undefined)
    }
    if (type === 'range') {
      const min = Number(el.querySelectorAll('input')[0]?.value || undefined)
      const max = Number(el.querySelectorAll('input')[1]?.value || undefined)
      return {
        min: isNaN(min) ? undefined : min,
        max: isNaN(max) ? undefined : max
      }
    }
    const n = Number(el.querySelectorAll('input')[0]?.value || undefined)
    const p = Number(el.querySelectorAll('input')[1]?.value || undefined)
    return {
      type: 'binomial',
      n: isNaN(n) ? undefined : n,
      p: isNaN(p) ? undefined : p
    }
  }

  return {
    ...Base,
    default: () => (config?.forceRange) ? {} : 0,
    render(path, value, view, options) {
      let curType = ''
      let input = ''
      if (value === undefined || typeof value === 'number') {
        curType = 'exact'
        input = `<input value=${value === undefined ? '' : value}>`
      } else if (value.type === 'binomial') {
        curType = 'binomial'
        input = `<label>${locale('range.n')}</label>
          <input value=${value.n === undefined ? '' : value.n}>
          <label>${locale('range.p')}</label>
          <input value=${value.p === undefined ? '' : value.p}>`
      } else {
        curType = 'range'
        input = `<label>${locale('range.min')}</label>
          <input value=${value.min === undefined ? '' : value.min}>
          <label>${locale('range.max')}</label>
          <input value=${value.max === undefined ? '' : value.max}>`
      }
      const id = view.registerChange(el => {
        view.model.set(path, getState(el))
      })
      const selectId = view.register(el => {
        (el as HTMLInputElement).value = curType
        el.addEventListener('change', evt => {
          const target = (el as HTMLInputElement).value
          const newValue = target === 'exact' ? this.default() :
            target === 'binomial' ? {type: 'binomial'} : {}
          view.model.set(path, newValue)
          evt.stopPropagation()
        })
      })
      return `<div class="node range-node node-header" data-id="${id}" ${path.error(false)}>
        ${options?.prepend ?? ''}
        <label>${options?.label ?? path.locale()}</label>
        ${options?.inject ?? ''}
        ${config?.forceRange ? `` : `<select data-id="${selectId}">
          <option value="exact">${locale('range.exact')}</option>
          <option value="range">${locale('range.range')}</option>
          ${config?.allowBinomial ? `
            <option value="binomial">${locale('range.binomial')}</option>
          ` : ``}
        </select>`}
        ${input}
      </div>`
    },
    validate(path, value, errors, options) {
      if (typeof value !== 'number' && typeof value !== 'object') {
        errors.add(path, 'error.expected_range')
        return value
      }
      if (value === undefined || typeof value === 'number') {
        if (config?.forceRange) {
          errors.add(path, 'error.invalid_exact')
        }
        numberNode.validate(path, value, errors, options)
      } else if (value.type === 'binomial') {
        if (config?.allowBinomial) {
          NumberNode({ min: 0, integer: true }).validate(path.push('n'), value.n, errors, options)
          NumberNode({ min: 0, max: 1 }).validate(path.push('p'), value.p, errors, options)
        } else {
          errors.add(path, 'error.invalid_binomial')
        }
      } else {
        if (value.min !== undefined) {
          numberNode.validate(path.push('min'), value.min, errors, options)
        }
        if (value.max !== undefined) {
          numberNode.validate(path.push('max'), value.max, errors, options)
        }
      }
      return value
    }
  }
}
