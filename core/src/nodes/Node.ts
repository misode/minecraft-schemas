import { DataModel } from '../model/DataModel'
import { ModelPath, Path } from '../model/Path'
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
  transform: (path: ModelPath, value: T, view: SourceView) => any

  /**
   * Determines whether the node should be enabled for this path
   * @param path
   * @param model
   */
  enabled: (path: ModelPath, model: DataModel) => boolean

  /**
   * Determines whether the node should always have a value present
   */
  force: () => boolean

  /**
   * Determines whether the node should be kept when empty
   */
  keep: () => boolean

  /**
   * Navigate to the specific child of this node according to the path
   * @param path The path of the target node
   * @param index The index of the path element that the current node is at. 
   * For example, in object `{ foo: { bar: true } }` with path `foo.bar`,
   * the index for the root object is `-1`, 
   * the one for the inner object is `0` (which is the index of `foo` in `foo.bar`),
   * and the one for the boolean value is `1` (which is the index of `bar` in `foo.bar`)
   * @param value The value corresponding to the schema node
   */
  navigate: (path: ModelPath, index: number) => INode | undefined

  /**
   * Get the path to the child node corresponding to the `key`
   * - For `ChoiceNode`: Call the `pathPush` method from the matched node.
   * - For `ListNode`: Returns the path of the specific child.
   * - For `ObjectNode`: Returns the path of the specific child, with the locale arrays handled.
   * - For other nodes: Returns the path without changes.
   */
  pathPush: (path: ModelPath, key: string | number) => ModelPath

  /**
   * Renders the node and handles events to update the model
   * @param path 
   * @param value 
   * @param view tree view context, containing the model
   * @param options optional render options
   * @returns string HTML representation of this node using the given data
   */
  render: (path: ModelPath, value: T, view: TreeView, options?: NodeOptions) => string

  /**
   * Provide code suggestions for this node. The result are valid JSON strings that can be used
   * in JSON directly without triggering any syntax errors; e.g. string suggestions, including
   * object key suggestions, have double quotation marks surrounding them, while boolean suggestions
   * and number suggestions don't
   * - For `BooleanNode`: Returns a list containing `false` and `true`.
   * - For `ChoiceNode`: Returns suggestions of the matched choice node.
   * - For `EnumNode`: Returns all the options.
   * - For `MapNode`: Returns all the suggestions provided by the key node, surrounded in double 
   * quotation marks.
   * - For `ObjectNode`: Returns all possible keys that can be used under this object, 
   * surrounded in double quotation marks. 
   * Keys existing in the `value` will be excluded from the suggestion.
   * - For other nodes: Returns an empty list.
   * @param path The path of this node
   * @param value The value corresponding to this node
   */
  suggest: (path: ModelPath, value: T) => string[]

  /**
   * Validates the model using this schema
   * 
   * When encountering an invalid value, it should either silently repair it
   * or add an error and retain the original value
   * @param value value to be validated
   */
  validate: (path: ModelPath, value: T, errors: Errors, options: NodeOptions) => any

  /**
   * Get the validation option of this node. The client of this schema may
   * do more detailed validation according to this option
   * - For `EnumNode` and `StringNode`: Returns the corresponding `validation` in their `options`.
   * - For `MapNode`: Returns the corresponding `validation` in their `options`, or the `validationOption`
   * of their key node if the former is `undefined`.
   * - For `ChoiceNode`: Returns the corresponding `validationOption` of the matched choice's node.
   * - For other nodes: Returns `undefined`.
   */
  validationOption: (path: ModelPath) => ValidationOption | undefined

  [custom: string]: any
}

export const Base: INode = ({
  default: () => undefined,
  transform: (_, v) => v,
  enabled: () => true,
  force: () => false,
  keep: () => false,
  navigate() { return this }, // Not using arrow functions, because we want `this` here binds to the actual node.
  pathPush: (p) => p,
  render: () => '',
  suggest: () => [],
  validate: (_, v) => v,
  validationOption: () => undefined
})

export const Mod = (node: INode, mods: Partial<INode>): INode => ({
  ...node, ...mods
})

export const Has = (key: string, node: INode<any>) => Mod(node, {
  enabled: (p: ModelPath) => p.push(key).get() !== undefined
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
