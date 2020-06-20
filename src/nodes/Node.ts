import { DataModel } from '../model/DataModel'
import { Path } from '../model/Path'
import { TreeView } from '../view/TreeView'
import { SourceView } from '../view/SourceView'
import { Errors } from '../model/Errors'

export type NodeOptions = {
  hideHeader?: boolean
  collapse?: boolean
  prepend?: string
  label?: string
  inject?: string
  loose?: boolean
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

  [custom: string]: any
}

export const Base: INode = ({
  default: () => undefined,
  transform: (_, v) => v,
  enabled: () => true,
  force: () => false,
  render: () => '',
  validate: (_, v) => v
})

export const Mod = (node: INode, mods: Partial<INode>): INode => ({
  ...node, ...mods
})

export function Force<T>(node: INode<T>, defaultValue?: T): INode {
  return {
    ...node,
    force: () => true,
    default: () => defaultValue ? defaultValue : node.default()
  }
}
