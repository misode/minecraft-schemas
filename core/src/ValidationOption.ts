export type ValidationOption =
  | CommandValidationOption
  | EntityValidationOption
  | NbtValidationOption
  | NbtPathValidationOption
  | ObjectiveValidationOption
  | ResourceValidationOption
  | VectorValidationOption

export type CommandValidationOption = {
  validator: 'command',
  params: {
    leadingSlash?: boolean,
    allowPartial?: boolean
  }
}

export type EntityValidationOption = {
  validator: 'entity',
  params: {
    amount: 'single' | 'multiple',
    type: 'players' | 'entities',
    isScoreHolder?: boolean
  }
}

export type NbtValidationOption = {
  validator: 'nbt',
  params: {
    category: 'minecraft:block' | 'minecraft:entity' | 'minecraft:item',
    id?: string,
    inPredicate?: boolean,
    enclosingTag?: () => string
  }
}

export type NbtPathValidationOption = {
  validator: 'nbt_path',
  params?: {
    category?: 'minecraft:block' | 'minecraft:entity' | 'minecraft:item',
    id?: string
  }
}

export type ObjectiveValidationOption = {
  validator: 'objective',
  params?: {}
}

type ResourceType = '$storages'

export type ResourceValidationOption = {
  validator: 'resource',
  params: {
    pool: ResourceType | string[],
    allowTag?: boolean,
    allowUnknown?: Boolean
  }
}

export type VectorValidationOption = {
  validator: 'vector',
  params: {
    dimension: 2 | 3 | 4,
    isInteger?: boolean,
    disableLocal?: boolean,
    disableRelative?: boolean,
    min?: number,
    max?: number
  }
}
