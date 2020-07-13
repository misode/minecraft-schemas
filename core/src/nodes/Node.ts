import { DataModel } from '../model/DataModel'
import { Path } from '../model/Path'
import { TreeView } from '../view/TreeView'
import { SourceView } from '../view/SourceView'
import { Errors } from '../model/Errors'
import { ValidationOption } from '../ValidationOption'

export type NodeOptions = {
  hideHeader?: boolean
  collapse?: boolean
  prepend?: string
  label?: string
  inject?: string
  loose?: boolean
  init?: boolean
}

export interface INode<T = any> {

  /**
   * The default value of this node
   * @param value optional original value
   */
  default: () => T

  /**
   * Transforms the data model to the final output format
   */
  transform: (path: Path, value: T, view: SourceView) => any

  /**
   * Determines whether the node should be enabled for this path
   * @param path
   * @param model
   */
  enabled: (path: Path, model: DataModel) => boolean

  /**
   * Determines whether the node should always have a value present
   */
  force: () => boolean

  /**
   * Determines whether the node should be kept when empty
   */
  keep: () => boolean

  /**
   * Get all possible keys that can be used under this object
   * @param path The path of this object node
   * @param value The value corresponding to this object node
   */
  keys: (path: Path, value: any) => string[]

  /**
   * Navigate to the specific child of this node according to the path
   * @param path The path of the target node
   * @param index The index of the model path element that the current node 
   * is at. For example, in object `{ foo: { bar: true } }` with path `foo.bar`,
   * the index for the root object is `-1`, the one for the inner object is `0`,
   * and the one for the boolean value is `1`.
   */
  navigate: (path: Path, index: number) => INode | undefined

  /**
   * Renders the node and handles events to update the model
   * @param path 
   * @param value 
   * @param view tree view context, containing the model
   * @param options optional render options
   * @returns string HTML representation of this node using the given data
   */
  render: (path: Path, value: T, view: TreeView, options?: NodeOptions) => string

  /**
   * Validates the model using this schema
   * 
   * When encountering an invalid value, it should either silently repair it
   * or add an error and retain the original value
   * @param value value to be validated
   */
  validate: (path: Path, value: any, errors: Errors, options: NodeOptions) => any

  /**
   * Get the validation option of this node. The client of this schema may
   * do more detailed validation according to this option
   */
  validationOption: () => ValidationOption | undefined

  [custom: string]: any
}

export const Base: INode = ({
  default: () => undefined,
  transform: (_, v) => v,
  enabled: () => true,
  force: () => false,
  keep: () => false,
  keys: () => [],
  navigate() { return this }, // Not using arrow functions, because we want `this` here binds to the actual node.
  render: () => '',
  validate: (_, v) => v,
  validationOption: () => undefined
})

export const Mod = (node: INode, mods: Partial<INode>): INode => ({
  ...node, ...mods
})

export function Force<T>(node: INode<T>, defaultValue?: T): INode {
  return {
    ...node,
    force: () => true,
    keep: () => !node.keep(),
    default: () => defaultValue ? defaultValue : node.default(),
    validate: (p, v, e, o) => {
      if (o.loose && o.init) {
        return node.validate(p, v ?? defaultValue, e, o)
      } else {
        return node.validate(p, v, e, o)
      }
    }
  }
}

export function Keep<T>(node: INode<T>): INode<T> {
  return {
    ...node,
    keep: () => true
  }
}