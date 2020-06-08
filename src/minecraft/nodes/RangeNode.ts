import { INode, Base } from '../../nodes/Node'
import { locale } from '../../Registries'

export type IRange = number
  | { min?: number, max?: number, type?: 'uniform' }
  | { n?: number, p?: number, type: 'binomial' }

type RangeNodeConfig = {
  /** Whether only integers are allowed */
  integer?: boolean
}

export const RangeNode = (config?: RangeNodeConfig): INode<IRange> => {
  const parseNumber = (str: string): number => {
    return config?.integer ? parseInt(str) : parseFloat(str)
  }
  const getState = (el: Element): IRange => {
    const type = el.querySelector('select')!.value
    if (type === 'exact') {
      return parseNumber(el.querySelector('input')!.value)
    }
    if (type === 'range') {
      const min = parseNumber(el.querySelectorAll('input')[0].value)
      const max = parseNumber(el.querySelectorAll('input')[1].value)
      return {
        min: isNaN(min) ? undefined : min,
        max: isNaN(max) ? undefined : max
      }
    }
    const n = parseInt(el.querySelectorAll('input')[0].value)
    const p = parseFloat(el.querySelectorAll('input')[1].value)
    return {
      type: 'binomial',
      n: isNaN(n) ? undefined : n,
      p: isNaN(p) ? undefined : p
    }
  }

  return {
    ...Base,
    default: () => 0,
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
      return `<div class="node range-node node-header" data-id="${id}">
        ${options?.removeId ? `<button class="remove" data-id="${options?.removeId}"></button>` : ``}
        ${options?.hideLabel ? `` : `<label>${locale(path)}</label>`}
        <select data-id="${selectId}">
          <option value="exact">${locale('range.exact')}</option>
          <option value="range">${locale('range.range')}</option>
          <option value="binomial">${locale('range.binomial')}</option>
        </select>
        ${input}
      </div>`
    }
  }
}
