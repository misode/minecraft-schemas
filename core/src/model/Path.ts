import { DataModel } from './DataModel'
import { LOCALES } from '../Registries'

export type PathElement = number | string

/**
 * Immutable helper class to represent a path in data
 */
export class Path {
  modelArr: PathElement[]
  localeArr: string[]
  model?: DataModel

  /**
   * @param modelArr Initial array of path model elements. Empty if not given
   * @param localeArr Initial array of path locale elements. Empty if not given
   * @param model Model attached to this path
   */
  constructor(modelArr?: PathElement[], localeArr?: string[], model?: DataModel) {
    this.modelArr = modelArr ?? []
    this.localeArr = localeArr ?? []
    this.model = model
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
    return new Path(this.modelArr.slice(start, end), this.localeArr, this.model)
  }

  /**
   * A new path with the first model element removed
   */
  shift(): Path {
    return new Path(this.modelArr.slice(1), this.localeArr, this.model)
  }

  /**
   * A new path with the last model element removed
   */
  pop(): Path {
    return new Path(this.modelArr.slice(0, -1), this.localeArr, this.model)
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
    return new Path([...this.modelArr, element], [...this.localeArr], this.model)
  }

  /**
   * Push an element exclusivly to the locale array
   * @param element 
   */
  localePush(element: PathElement) {
    if (typeof element === 'number') return this.copy()
    const newElement = element.startsWith('minecraft:') ? element.slice(10) : element
    return new Path([...this.modelArr], [...this.localeArr, newElement], this.model)
  }

  copy(): Path {
    return new Path([...this.modelArr], [...this.localeArr], this.model)
  }

  getArray(): PathElement[] {
    return this.modelArr
  }

  /**
   * Attaches a model to this path and all paths created from this
   * @param model 
   */
  withModel(model: DataModel): Path {
    return new Path([...this.modelArr], [...this.localeArr], model)
  }

  getModel(): DataModel | undefined {
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
  set(value: any) {
    this.model?.set(this, value)
  }

  /**
   * Gets the locale of a key from the locale registry.
   * 
   * @param key string or path that refers to a locale ID.
   *    If a string is given, an exact match is required.
   *    If a path is given, it finds the longest match at the end.
   * @returns undefined if the key isn't found for the selected language
   */
  locale = (): string => {
    let path = this.localeArr.slice(-5)
    while (path.length > 0) {
      const locale = LOCALES.getLocale(path.join('.'))
      if (locale !== undefined) return locale
      path.shift()
    }
    path = this.localeArr.slice(-5)
    while (path.length > 0) {
      const locale = LOCALES.get('en')[path.join('.')]
      if (locale !== undefined) return locale
      path.shift()
    }
    // return this.localeArr.slice(0, 5).join('.')
    return (this.localeArr[this.localeArr.length - 1] ?? '')
  }

  /**
   * Gets the error inside this path if the model is attached
   * @returns a html attribute containing the error message
   */
  error(exact = true) {
    const errors = this.model?.errors.get(this, exact) ?? []
    if (errors.length === 0) return ''
    return `data-error="${errors[0].error}"`
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
