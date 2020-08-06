import { INode, NodeOptions } from './Node'
import { SchemaRegistry } from '../Registries'

type Options = NodeOptions

export const Reference = (schemas: SchemaRegistry, schema: string, config?: Options): INode => ({
  default: (...args) => schemas.get(schema).default(...args),
  transform: (...args) => schemas.get(schema).transform(...args),
  enabled: (...args) => schemas.get(schema).enabled(...args),
  force: (...args) => schemas.get(schema).force(...args),
  keep: (...args) => config?.collapse || schemas.get(schema).keep(...args),
  suggest: (p, v) => schemas.get(schema).suggest(p, v),
  navigate: (p, i) => schemas.get(schema).navigate(p, i),
  pathPush: (p, k) => schemas.get(schema).pathPush(p, k),
  render: (p, v, t, options) => schemas.get(schema).render(p, v, t, {...options, ...config}),
  validate: (p, v, e, options) => schemas.get(schema).validate(p, v, e, {...options, ...config}),
  validationOption: (v) => schemas.get(schema).validationOption(v),
})
