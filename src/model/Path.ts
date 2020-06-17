import { DataModel } from './DataModel'
import { LOCALES } from '../Registries'

export type PathElement = (string | number)

/**
 * Immutable helper class to represent a path in data
 * @implements {Iterable<PathElement>}
 */
export class Path implements Iterable<PathElement> {
  private arr: PathElement[]
  model?: DataModel

  /**
   * @param arr Initial array of path elements. Empty if not given
   * @param model Model attached to this path
   */
  constructor(arr?: PathElement[], model?: DataModel) {
    this.arr = arr ?? []
    this.model = model
  }

  /**
   * The last element of this path
   */
  last(): PathElement {
    return this.arr[this.arr.length - 1]
  }

  /**
   * A new path with the last element removed
   */
  pop(): Path {
    return new Path(this.arr.slice(0, -1), this.model)
  }

  /**
   * A new path with an element added at the end
   * @param element element to push at the end of the array
   */
  push(element: PathElement): Path {
    return new Path([...this.arr, element], this.model)
  }

  copy(): Path {
    return new Path([...this.arr], this.model)
  }

  getArray(): PathElement[] {
    return this.arr
  }

  /**
   * Attaches a model to this path and all paths created from this
   * @param model 
   */
  withModel(model: DataModel): Path {
    return new Path([...this.arr], model)
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
    let path = this.arr.filter(e => (typeof e === 'string'))
    while (path.length > 0) {
      const locale = LOCALES.getLocale(path.join('.'))
      if (locale !== undefined) return locale
      path.shift()
    }
    path = this.arr.filter(e => (typeof e === 'string'))
    while (path.length > 0) {
      const locale = LOCALES.get('en')[path.join('.')]
      if (locale !== undefined) return locale
      path.shift()
    }
    return (this.last() ?? '').toString().replace(/^minecraft:/, '')
  }

  /**
   * Gets the error inside this path if the model is attached
   * @returns a html attribute containing the error message
   */
  error() {
    const errors = this.model?.errors.get(this, true) ?? []
    if (errors.length === 0) return ''
    return `data-error="${errors[0].error}"`
  }

  /**
   * Checks path equality
   * @param other path to compare
   */
  equals(other: Path) {
    return other.arr.length === this.arr.length && other.arr.every((v, i) => v === this.arr[i])
  }

  /**
   * Checks if this path is inside another path
   * @param other parent path where this path should be inside
   */
  inside(other: Path) {
    return other.arr.every((v, i) => v === this.arr[i])
  }

  toString(): string {
    return this.arr
      .map(e => (typeof e === 'string') ? `.${e}` : `[${e}]`)
      .join('')
      .replace(/^\./, '')
  }

  *[Symbol.iterator]() {
    for (const e of this.arr) {
      yield e
    }
  }
}
