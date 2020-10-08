import { INode } from "./nodes/Node"
import { BooleanHookParams } from "./nodes/BooleanNode"
import { ChoiceHookParams } from "./nodes/ChoiceNode"
import { ListHookParams } from "./nodes/ListNode"
import { MapHookParams } from "./nodes/MapNode"
import { NumberHookParams } from "./nodes/NumberNode"
import { ObjectHookParams } from "./nodes/ObjectNode"
import { StringHookParams } from "./nodes/StringNode"
import { ModelPath } from "./model/Path"

export type Hook<T extends any[], S> = {
  base: (params: {node: INode}, path: ModelPath, ...t: T) => S
  boolean: (params: {node: INode} & BooleanHookParams, path: ModelPath, ...t: T) => S
  choice: (params: {node: INode} & ChoiceHookParams, path: ModelPath, ...t: T) => S
  list: (params: {node: INode} & ListHookParams, path: ModelPath, ...t: T) => S
  map: (params: {node: INode} & MapHookParams, path: ModelPath, ...t: T) => S
  number: (params: {node: INode} & NumberHookParams, path: ModelPath, ...t: T) => S
  object: (params: {node: INode} & ObjectHookParams, path: ModelPath, ...t: T) => S
  string: (params: {node: INode} & StringHookParams, path: ModelPath, ...t: T) => S
}
