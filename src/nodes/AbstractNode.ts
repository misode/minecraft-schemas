import { DataModel } from '../model/DataModel'
import { Path } from '../model/Path'
import { TreeView } from '../view/TreeView'
import { SourceView } from '../view/SourceView'
import { Errors } from '../model/Errors'

/**
 * Schema node that supports some standard transformations
 */
export interface INode<T> {
  default: (value?: T) => T | undefined
  transform: (path: Path, value: T, view: SourceView) => any
  enabled: (path: Path, model: DataModel) => boolean
  render: (path: Path, value: T, view: TreeView, options?: RenderOptions) => string
  validate: (path: Path, value: any, errors: Errors) => boolean
}

export interface StringLikeNode extends INode<string> {
  getState: (el: Element) => string
  renderRaw: (path: Path) => string
}

export type RenderOptions = {
  hideLabel?: boolean
  syncModel?: boolean
  collapse?: boolean
}

export type NodeChildren = {
  [name: string]: INode<any>
}

export type IDefault<T> = (value?: T) => T | undefined
export type ITransform<T> = (value: T) => any
export type IEnable = (path: Path) => boolean
export type IForce = () => boolean

export interface NodeMods<T> {
  default?: IDefault<T>
  transform?: ITransform<T>
  enable?: IEnable
  force?: IForce
}

/**
 * Basic implementation of the nodes
 * 
 * h
 */
export abstract class AbstractNode<T> implements INode<T> {
  defaultMod: IDefault<T>
  transformMod: ITransform<T>
  enableMod: IEnable
  forceMod: IForce

  /**
   * @param mods modifiers of the default transformations
   */
  constructor(mods?: NodeMods<T>) {
    this.defaultMod = mods?.default ?? ((v) => v)
    this.transformMod = mods?.transform ?? ((v) => v)
    this.enableMod = mods?.enable ?? (() => true)
    this.forceMod = mods?.force ?? (() => false)
  }

  /**
   * The default value of this node
   * @param value optional original value
   */
  default(value?: T) {
    return this.defaultMod(value)
  }

  /**
   * Transforms the data model to the final output format
   * @param 
   */
  transform(path: Path, value: T, view: SourceView) {
    if (!this.enabled(path)) return undefined
    if (value === undefined && this.force()) value = this.default(value)!
    return this.transformMod(value)
  }

  /**
   * Determines whether the node should be enabled for this path
   * @param path
   * @param model
   */
  enabled(path: Path, model?: DataModel) {
    if (model) path = path.withModel(model)
    return this.enableMod(path.pop())
  }

  force(): boolean {
    return this.forceMod()
  }

  /**
   * Renders the node and handles events to update the model
   * @param path 
   * @param value 
   * @param view tree view context, containing the model
   * @param options optional render options
   * @returns string HTML representation of this node using the given data
   */
  abstract render(path: Path, value: T, view: TreeView, options?: RenderOptions): string

  /**
   * Validates the model using this schema
   * @param value value to be validated
   */
  validate(path: Path, value: any, errors: Errors) {
    return true
  }
}
