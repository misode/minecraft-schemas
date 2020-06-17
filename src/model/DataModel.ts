import { Path } from './Path'
import { INode } from '../nodes/Node'
import { Errors } from './Errors'

export interface ModelListener {
  invalidated(model: DataModel): void
}

type DataModelOptions = {
  historyMax?: number
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

  /**
   * @param schema node to use as schema for this model
   */
  constructor(schema: INode, options?: DataModelOptions) {
    this.schema = schema
    this.data = schema.default()
    this.listeners = []
    this.errors = new Errors()
    this.validate()
    this.history = [JSON.stringify(this.data)]
    this.historyIndex = 0
    this.historyMax = options?.historyMax ?? 50
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
   * Validates the model, updates the history and 
   * notifies all listeners that the model is invalidated
   */
  invalidate() {
    this.validate()

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
    this.listeners.forEach(listener => listener.invalidated(this))
  }

  /**
   * Resets the full data and notifies listeners
   * @param value new model data
   */
  reset(value: any) {
    this.data = value
    this.invalidate()
  }

  /**
   * Gets the data at a specified path
   * @param path path at which to find the data
   * @returns undefined, if the the path does not exist in the data
   */
  get(path: Path) {
    let node = this.data;
    for (let index of path) {
      if (node === undefined) return node
      node = node[index]
    }
    return node
  }

  /**
   * Updates the date on a path. Node will be removed when value is undefined
   * @param path path to update
   * @param value new data at the specified path
   */
  set(path: Path, value: any) {
    console.log('Set', path.toString(), JSON.stringify(value))

    if (path.getArray().length === 0) {
      this.reset(value)
      return
    }

    let node = this.data;
    for (let index of path.pop()) {
      if (node[index] === undefined) {
        node[index] = {}
      }
      node = node[index]
    }


    if (value === undefined || (typeof value === 'number' && isNaN(value))) {
      if (typeof path.last() === 'number') {
        node.splice(path.last(), 1)
      } else {
        delete node[path.last()]
      }
    } else {
      node[path.last()] = value
    }

    this.invalidate()
  }

  /**
   * Go one step back in history
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex -= 1
      this.data = JSON.parse(this.history[this.historyIndex])
      this.validate()
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
      this.validate()
      this.silentInvalidate()
    }
  }

  /**
   * Uses the schema to check whether the data is valid
   */
  validate() {
    const path = new Path().withModel(this)
    this.errors.clear()
    this.data = this.schema.validate(path, this.data, this.errors)
  }
}
