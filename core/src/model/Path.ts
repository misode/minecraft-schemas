import { DataModel } from './DataModel'
import { LOCALES, locale } from '../Registries'

export type PathElement = number | string

/**
 * Immutable helper class to represent a path in data
 */
export class Path {
  modelArr: PathElement[]
  localeArr: string[]

  /**
   * @param modelArr Initial array of path model elements. Empty if not given
   * @param localeArr Initial array of path locale elements. Empty if not given
   */
  constructor(modelArr?: PathElement[], localeArr?: string[]) {
    this.modelArr = modelArr ?? []
    this.localeArr = localeArr ?? []
  }

  /**
   * The last model element of this path
   */
  last(): PathElement {
    return this.modelArr[this.modelArr.length - 1]
  }

  /**
   * A new path with the specific sliced module elements
   */
  slice(start?: number, end?: number): Path {
    return new Path(this.modelArr.slice(start, end), this.localeArr)
  }

  /**
   * A new path with the first model element removed
   */
  shift(): Path {
    return new Path(this.modelArr.slice(1), this.localeArr)
  }

  /**
   * A new path with the last model element removed
   */
  pop(): Path {
    return new Path(this.modelArr.slice(0, -1), this.localeArr)
  }

  /**
   * A new path with an element added at the end
   * @param element element to push at the end of the array
   */
  push(element: PathElement): Path {
    return this.modelPush(element).localePush(element)
  }

  /**
   * Push an element exclusivly to the model array
   * @param element 
   */
  modelPush(element: PathElement) {
    return new Path([...this.modelArr, element], [...this.localeArr])
  }

  /**
   * Push an element exclusivly to the locale array
   * @param element 
   */
  localePush(element: PathElement) {
    if (typeof element === 'number') return this.copy()
    const newElement = element.startsWith('minecraft:') ? element.slice(10) : element
    return new Path([...this.modelArr], [...this.localeArr, newElement])
  }

  copy(): Path {
    return new Path([...this.modelArr], [...this.localeArr])
  }

  getArray(): PathElement[] {
    return this.modelArr
  }

  /**
   * Attaches a model to this path and all paths created from this
   * @param model 
   */
  withModel(model: DataModel): ModelPath {
    return new ModelPath(model, this)
  }

  /**
   * Gets the locale of a key from the locale registry.
   * 
   * @param params optional locale parameters
   * @returns the key itself if it isn't found
   */
  locale (params?: string[]): string {
    const res = this.strictLocale(params)
    if (res !== undefined) return res
    // return this.localeArr.slice(-5).join('.')
    return this.localeArr[this.localeArr.length - 1] ?? ''
  }

  /**
   * Gets the locale of a key from the locale registry.
   * 
   * @param params optional locale parameters
   * @param depth path depth to start, defaults to 5
   * @param minDepth minimum length of the path, defaults to 1
   * @returns undefined if the key isn't found
   */
  strictLocale(params?: string[], depth = 5, minDepth = 1): string | undefined {
    let path = this.localeArr.slice(-depth)
    while (path.length >= minDepth) {
      const locale = LOCALES.getLocale(path.join('.'), params)
      if (locale !== undefined) return locale
      path.shift()
    }
    path = this.localeArr.slice(-depth)
    while (path.length >= minDepth) {
      const locale = LOCALES.getLocale(path.join('.'), params, 'en')
      if (locale !== undefined) return locale
      path.shift()
    }
    return undefined
  }

  /**
   * Checks path equality
   * @param other path to compare
   */
  equals(other: Path) {
    return other.modelArr.length === this.modelArr.length
      && other.modelArr.every((v, i) => v === this.modelArr[i])
  }

  /**
   * Checks if this path is inside another path
   * @param other parent path where this path should be inside
   */
  inside(other: Path) {
    return other.modelArr.every((v, i) => v === this.modelArr[i])
  }

  toString(): string {
    return this.modelArr
      .map(e => (typeof e === 'string') ? `.${e}` : `[${e}]`)
      .join('')
      .replace(/^\./, '')
  }

  forEach(fn: (value: PathElement, index: number, array: PathElement[]) => void, thisArg?: any) {
    return this.modelArr.forEach(fn, thisArg)
  }
}

export class ModelPath extends Path {
  model: DataModel

  constructor(model: DataModel, path?: Path) {
    super(path?.modelArr, path?.localeArr) 
    this.model = model
  }

  getModel(): DataModel {
    return this.model
  }
  
  /**
   * Gets the data from the model if it was attached
   * @returns undefined, if no model was attached
   */
  get(): any {
    return this.model?.get(this)
  }

  /**
   * Sets the value to the model if it was attached
   */
  set(value: any): void {
    this.model?.set(this, value)
  }

  /**
   * Gets the error inside this path if the model is attached
   * @returns a html attribute containing the error message
   */
  error(exact = true): string {
    const errors = this.model.errors.get(this, exact)
    if (errors.length === 0) return ''
    return `data-error="${locale(errors[0].error, errors[0].params)}"`
  }

  /**
   * Gets the error inside this path if the model is attached
   * @returns a html attribute containing the error message
   */
  help(): string {
    const res = this.localePush('help').strictLocale([], 6)
    if (res === undefined) return ''
    return `data-help="${res}"`
  }

  /**
   * A new path with the specific sliced module elements
   */
  slice(start?: number, end?: number): ModelPath {
    return new ModelPath(this.model, super.slice(start, end))
  }

  /**
   * A new path with the first model element removed
   */
  shift(): ModelPath {
    return new ModelPath(this.model, super.shift())
  }

  /**
   * A new path with the last model element removed
   */
  pop(): ModelPath {
    return new ModelPath(this.model, super.pop())
  }

  /**
   * A new path with an element added at the end
   * @param element element to push at the end of the array
   */
  push(element: PathElement): ModelPath {
    return this.modelPush(element).localePush(element)
  }

  /**
   * Push an element exclusivly to the model array
   * @param element 
   */
  modelPush(element: PathElement): ModelPath {
    return new ModelPath(this.model, super.modelPush(element))
  }

  /**
   * Push an element exclusivly to the locale array
   * @param element 
   */
  localePush(element: PathElement): ModelPath {
    return new ModelPath(this.model, super.localePush(element))
  }

  copy(): ModelPath {
    return new ModelPath(this.model, super.copy())
  }

}
