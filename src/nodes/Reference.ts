import { INode, NodeOptions } from './Node'
import { SCHEMAS } from '../Registries'

type Options = NodeOptions

export const Reference = (schema: string, config?: Options): INode => ({
  default: (...args) => SCHEMAS.get(schema).default(...args),
  transform: (...args) => SCHEMAS.get(schema).transform(...args),
  enabled: (...args) => SCHEMAS.get(schema).enabled(...args),
  force: (...args) => SCHEMAS.get(schema).force(...args),
  render: (p, v, t, options) => SCHEMAS.get(schema).render(p, v, t, {...options, ...config}),
  validate: (p, v, e, options) => SCHEMAS.get(schema).validate(p, v, e, {...options, ...config})
})
