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
      console.error(`Tried to access schema "${id}", but that doesn't exist.`)
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
      console.warn(`Tried to access collection "${id}", but that doesn't exist.`)
    }
    return list ?? []
  }
}

type SchemaVersion = { 
  /**
   * Stores all the built-in collections for this version. The client of this module
   * needs to futhermore register the vanilla registries: the collection IDs
   * shouldn't contain the namespace (`minecraft:`) part, while the values within the
   * collections should. 
   * 
   * @example
   * for (const key in VANILLA_REGISTRIES>) {
   *   collections.register(
   *     key.replace(/^minecraft:/, ''), 
   *     Object.keys(VANILLA_REGISTRIES[key].entries)
   *   )
   * }
   */
  collections: CollectionRegistry, 
  schemas: SchemaRegistry 
}

/**
 * Registry for versions
 */
export class VersionRegistry implements Registry<SchemaVersion> {
  private registry: { [id: string]: SchemaVersion } = {}

  register(id: string, version: SchemaVersion) {
    this.registry[id] = version
  }

  get(id: string) {
    const list = this.registry[id]
    if (list === undefined) {
      console.warn(`Tried to access schema for version "${id}", but that doesn't exist.`)
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

  getLocale(key: string, params?: string[], language?: string) {
    const value = this.get(language ?? this.language)[key]
    if (value === undefined || !params) return value
    return value.replace(/%\d+%/g, match => {
      const index = parseInt(match.slice(1, -1))
      return params[index] ?? match
    })
  }
}

export const VERSIONS = new VersionRegistry()
export const LOCALES = new LocaleRegistry()

/**
 * Gets the locale of a key from the locale registry.
 * 
 * @param key string that refers to a locale ID.
 * @param params optional parameters
 * @returns the key itself if it isn't found for the selected language
 */
export const locale = (key: string, params?: string[]) => {
  let value = LOCALES.getLocale(key, params)
  if (value === undefined) value = LOCALES.getLocale(key, params, 'en')
  if (value === undefined) value = key
  return value
}
