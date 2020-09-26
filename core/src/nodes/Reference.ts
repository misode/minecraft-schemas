import { INode, NodeOptions } from './Node'
import { SchemaRegistry } from '../Registries'
import { ModelPath } from '../model/Path'
import { Mounter } from '../Mounter'
import { Errors } from '../model/Errors'

export const Reference = <T>(schemas: SchemaRegistry, schema: string): INode<T> => ({
  type(path: ModelPath) {
    return schemas.get(schema).type.bind(this)(path)
  },
  default() {
    return schemas.get(schema).default.bind(this)()
  },
  transform(path: ModelPath, value: T) {
    return schemas.get(schema).transform(path, value)
  },
  enabled(path: ModelPath) {
    return schemas.get(schema).enabled.bind(this)(path)
  },
  keep() {
    return schemas.get(schema).keep.bind(this)()
  },
  optional() {
    return schemas.get(schema).optional.bind(this)()
  },
  navigate(path: ModelPath, index: number) {
    return schemas.get(schema).navigate.bind(this)(path, index)
  },
  pathPush(path: ModelPath, key: string | number) {
    return schemas.get(schema).pathPush.bind(this)(path, key)
  },
  render(path: ModelPath, value: T, mounter: Mounter) {
    return schemas.get(schema).render.bind(this)(path, value, mounter)
  },
  suggest(path: ModelPath, value: T) {
    return schemas.get(schema).suggest.bind(this)(path, value)
  },
  validate(path: ModelPath, value: T, errors: Errors, options: NodeOptions) {
    return schemas.get(schema).validate.bind(this)(path, value, errors, options)
  },
  validationOption(path: ModelPath) {
    return schemas.get(schema).validationOption.bind(this)(path)
  },
  activeCase(path: ModelPath) {
    return schemas.get(schema).activeCase.bind(this)(path)
  },
  renderRaw(path: ModelPath, mounter: Mounter, inputId?: string) {
    return schemas.get(schema).renderRaw.bind(this)(path, mounter, inputId)
  }
})
