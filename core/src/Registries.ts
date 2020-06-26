import { INode } from './nodes/Node'

export interface Registry<T> {
  register(id: string, value: T): void
  get(id: string): T
}

/**
 * Registry for schemas
 */
export class SchemaRegistry implements Registry<INode> {
  private registry: { [id: string]: INode } = {}

  register(id: string, node: INode) {
    this.registry[id] = node
  }

  get(id: string) {
    const node = this.registry[id]
    if (node === undefined) {
      console.error(`Tried to access schema "${id}, but that doesn't exit.`)
    }
    return node
  }
}

/**
 * Registry for collections
 */
export class CollectionRegistry implements Registry<string[]> {
  private registry: { [id: string]: string[] } = {}

  register(id: string, list: string[]) {
    this.registry[id] = list
  }

  get(id: string) {
    const list = this.registry[id]
    if (list === undefined) {
      console.warn(`Tried to access collection "${id}", but that doesn't exist`)
    }
    return list ?? []
  }
}

/**
 * Registry for locales
 */
export interface Locale {
  [key: string]: string
}

export class LocaleRegistry implements Registry<Locale> {
  private registry: { [id: string]: Locale } = {}
  language: string = ''

  /**
   * 
   * @param id locale identifier
   * @param locale object mapping keys to translations
   */
  register(id: string, locale: Locale): void {
    this.registry[id] = locale
  }

  get(id: string) {
    const locale = this.registry[id]
    return locale ?? {}
  }

  has(id: string) {
    return this.registry[id] !== undefined
  }

  getLocale(key: string) {
    return this.get(this.language)[key]
  }
}

export const SCHEMAS = new SchemaRegistry()
export const COLLECTIONS = new CollectionRegistry()
export const LOCALES = new LocaleRegistry()

/**
 * Gets the locale of a key from the locale registry.
 * 
 * @param key string that refers to a locale ID.
 * @param params optional parameters
 * @returns the key itself if it isn't found for the selected language
 */
export const locale = (key: string, params: string[] = []) => {
  let value = LOCALES.getLocale(key)
  if (value === undefined) value = LOCALES.get('en')[key]
  if (value === undefined) value = key

  value = value.replace(/%\d+%/g, match => {
    const index = parseInt(match.slice(1, -1))
    return params[index] ?? match
  })
  return value
}
