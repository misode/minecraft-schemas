import { Path } from './Path'
import { INode } from '../nodes/Node'
import { Errors } from './Errors'
import { hexId } from '../utils'

export type ModelListener = {
  invalidated?(model: DataModel): void
  errors?(errors: Errors): void
}

type DataModelOptions = {
  historyMax?: number
  verbose?: boolean
  wrapLists?: boolean
  initialData?: any
}

/**
 * Holding the data linked to a given schema
 */
export class DataModel {
  data: any
  schema: INode
  /** A list of listeners that want to be notified when the model is invalidated */
  listeners: ModelListener[]
  errors: Errors
  history: string[]
  historyIndex: number
  historyMax: number
  verbose: boolean
  wrapLists: boolean

  /**
   * @param schema node to use as schema for this model
   */
  constructor(schema: INode, options?: DataModelOptions) {
    this.historyMax = options?.historyMax ?? 50
    this.verbose = options?.verbose ?? false
    this.wrapLists = options?.wrapLists ?? false

    this.schema = schema
    const data = options?.initialData ?? schema.default()
    this.data = this.wrapLists ? DataModel.wrapLists(data) : data
    this.listeners = []
    this.errors = new Errors()
    this.history = [JSON.stringify(this.data)]
    this.historyIndex = 0
  }

  /**
   * Adds a listener to notify when the model is invalidated
   * @param listener the listener to be notified
   */
  addListener(listener: ModelListener) {
    this.listeners.push(listener)
  }

  /**
   * Removes a listener from this model
   * @param listener the listener to be removed
   */
  removeListener(listener: ModelListener) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * Updates the history and notifies all
   * listeners that the model is invalidated
   */
  invalidate() {
    const newHistory = JSON.stringify(this.data)
    if (this.history[this.historyIndex] !== newHistory) {
      this.historyIndex += 1
      this.history.splice(this.historyIndex, this.historyMax, newHistory)
      if (this.history.length > this.historyMax) {
        this.history.splice(0, 1)
        this.historyIndex -= 1
      }
    }

    this.silentInvalidate()
  }

  /**
   * Notifies all listeners that the model is invalidated
   */
  silentInvalidate() {
    this.listeners.forEach(l => {
      if (l.invalidated) l.invalidated(this)
      if (l.errors) l.errors(this.errors)
    })
  }

  /**
   * Resets the full data and notifies listeners
   * @param value new model data
   */
  reset(value: any, loose?: boolean) {
    this.data = value
    this.validate(loose)
    this.invalidate()
  }

  /**
   * Gets the data at a specified path
   * @param path path at which to find the data
   * @returns undefined, if the the path does not exist in the data
   */
  get(path: Path) {
    let node = this.data;
    path.forEach(e => {
      if (node === undefined) return node
      if (this.wrapLists && typeof e === 'number') {
        node = node[e].node
      } else {
        node = node[e]
      }
    })
    return node
  }

  /**
   * Updates the data on a path. Node will be removed when value is undefined
   * @param path path to update
   * @param value new data at the specified path
   */
  set(path: Path, value: any, silent?: boolean) {
    if (path.getArray().length === 0) {
      this.reset(value, true)
      return
    }

    let node = this.data;
    path.pop().forEach(e => {
      if (node[e] === undefined || typeof node[e] === 'string' || typeof node[e] === 'number') {
        if (this.wrapLists && typeof e === 'number') {
          node[e] = { node: {}, id: hexId() }
        } else {
          node[e] = {}
        }
      }
      if (this.wrapLists && typeof e === 'number') {
        node = node[e].node
      } else {
        node = node[e]
      }
    })

    if (node === null) return

    if (value === undefined || (typeof value === 'number' && isNaN(value))) {
      if (typeof path.last() === 'number') {
        node.splice(path.last(), 1)
      } else {
        delete node[path.last()]
      }
    } else if (this.wrapLists && typeof path.last() === 'number') {
      node[path.last()] = { node: value, id: hexId() }
    } else {
      node[path.last()] = value
    }

    if (silent) return

    if (this.verbose) {
      console.log('Set', path.toString(), JSON.stringify(value))
    }
    this.validate(true)
    this.invalidate()
  }

  /**
   * Go one step back in history
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex -= 1
      this.data = JSON.parse(this.history[this.historyIndex])
      this.validate(false)
      this.silentInvalidate()
    }
  }

  /**
   * Go one step forward in history.
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex += 1
      this.data = JSON.parse(this.history[this.historyIndex])
      this.validate(false)
      this.silentInvalidate()
    }
  }

  /**
   * Uses the schema to check whether the data is valid
   */
  validate(loose?: boolean) {
    const path = new Path().withModel(this)
    this.errors.clear()
    this.data = this.schema.validate(path, this.data, this.errors, { loose, wrapLists: this.wrapLists }) ?? {}
  }

  error(path: Path, error: string, ...params: any) {
    const tempErrors = new Errors()
    tempErrors.add(path, error, params)
    this.listeners.forEach(l => {
      if (l.errors) l.errors(tempErrors)
    })
  }

  static wrapLists(value: any): any {
    if (Array.isArray(value)) {
      const res = value.map(v => ({
        node: this.wrapLists(v),
        id: hexId(),
      }))
      for (const a of Object.getOwnPropertySymbols(value)) {
        res[a as any] = value[a as any]
      }
      return res
    } else if (typeof value === 'object' && value !== null) {
      const res: Record<string, any> = {}
      Object.entries(value).map(([k, v]) => {
          res[k] = this.wrapLists(v)
        })
      for (const a of Object.getOwnPropertySymbols(value)) {
        res[a as any] = value[a]
      }
      return res
    } else {
      return value
    }
  }

  static unwrapLists(value: any): any {
    if (Array.isArray(value)) {
      const res = value.map(v => this.unwrapLists(v.node))
      for (const a of Object.getOwnPropertySymbols(value)) {
        res[a as any] = value[a as any]
      }
      return res
    } else if (typeof value === 'object' && value !== null) {
      const res: Record<string, any> = {}
      Object.entries(value).map(([k, v]) => {
        res[k] = this.unwrapLists(v)
      })
      for (const a of Object.getOwnPropertySymbols(value)) {
        res[a as any] = value[a]
      }
      return res
    } else {
      return value
    }
  }
}
