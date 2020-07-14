import {
  EnumNode,
  Force,
  ObjectNode,
  MapNode,
  StringNode,
  ListNode,
  NumberNode,
  ChoiceNode,
  Resource,
} from '@mcschema/core'

export const BlockState = ObjectNode({
  Name: Force(EnumNode('block', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:block' } } })),
  Properties: MapNode(
    StringNode(),
    StringNode(),
    { validation: { validator: 'block_state_map', params: { id: ['pop', { push: 'Name' }] } } }
  )
})

export const FluidState = ObjectNode({
  Name: Force(EnumNode('fluid', { search: true, validation: { validator: 'resource', params: { pool: 'minecraft:fluid' } } })),
  Properties: Force(MapNode(
    StringNode(),
    StringNode()
  ))
})

export const BlockPos = ListNode(
  NumberNode({ integer: true })
)


type RangeConfig = {
  /** Whether only integers are allowed */
  integer?: boolean
  /** If specified, number will be capped at this minimum */
  min?: number
  /** If specified, number will be capped at this maximum */
  max?: number
  /** Whether binomials are allowed */
  allowBinomial?: boolean
  /** If true, only ranges are allowed */
  forceRange?: boolean
}

export const Range = (config?: RangeConfig) => ChoiceNode([
  ...(config?.forceRange ? [] : [{
    type: 'number',
    node: NumberNode(config),
    change: (v: any) => v === undefined ? 0 : v.min ?? v.max ?? v.n ?? 0
  }]),
  ...(config?.allowBinomial ? [{
    type: 'binomial',
    node: ObjectNode({
      type: Force(Resource(StringNode({ pattern: /^minecraft:binomial$/ }))),
      n: Force(NumberNode({ integer: true, min: 0 })),
      p: Force(NumberNode({ min: 0, max: 1 }))
    }),
    match: (v: any) => v !== undefined && v.type === 'minecraft:binomial',
    change: (v: any) => ({
      type: 'minecraft:binomial',
      n: typeof v === 'number' ? v : v === undefined ? 1 : (v.min ?? v.max ?? 1),
      p: 0.5
    })
  }]: []),
  {
    type: 'object',
    node: ObjectNode({
      min: NumberNode(config),
      max: NumberNode(config)
    }),
    change: (v: any) => ({
      min: typeof v === 'number' ? v : v === undefined ? 1 : v.n,
      max: typeof v === 'number' ? v : v === undefined ? 1 : v.n
    })
  }
], { choiceContext: 'range' })

type UniformIntConfig = {
  min?: number
  max?: number
  maxSpread?: number
}

export const UniformInt = (config?: UniformIntConfig) => ChoiceNode([
  {
    type: 'number',
    node: NumberNode({ integer: true, min: config?.min, max: config?.max }),
    change: v => v.base
  },
  {
    type: 'object',
    node: ObjectNode({
      base: Force(NumberNode({ integer: true, min: config?.min, max: config?.max })),
      spread: Force(NumberNode({ integer: true, min: 0, max: config?.maxSpread }))
    }),
    change: v => ({
      base: v,
      spread: 0
    })
  }
], { context: 'uniform_int' })
