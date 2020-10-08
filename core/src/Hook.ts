import { INode } from "./nodes/Node"
import { BooleanHookParams } from "./nodes/BooleanNode"
import { ChoiceHookParams } from "./nodes/ChoiceNode"
import { ListHookParams } from "./nodes/ListNode"
import { MapHookParams } from "./nodes/MapNode"
import { NumberHookParams } from "./nodes/NumberNode"
import { ObjectHookParams } from "./nodes/ObjectNode"
import { StringHookParams } from "./nodes/StringNode"
import { SwitchHookParams } from "./nodes/SwitchNode"

export type Hook<T extends any[], S> = {
  base: (params: {node: INode}, ...t: T) => S
  boolean: (params: {node: INode} & BooleanHookParams, ...t: T) => S
  choice: (params: {node: INode} & ChoiceHookParams, ...t: T) => S
  list: (params: {node: INode} & ListHookParams, ...t: T) => S
  map: (params: {node: INode} & MapHookParams, ...t: T) => S
  number: (params: {node: INode} & NumberHookParams, ...t: T) => S
  object: (params: {node: INode} & ObjectHookParams, ...t: T) => S
  string: (params: {node: INode} & StringHookParams, ...t: T) => S
  switch: (params: {node: INode} & SwitchHookParams, ...t: T) => S
}
