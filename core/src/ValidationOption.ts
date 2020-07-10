export type ValidationOption =
  | BlockStateMapValidationOption
  | CommandValidationOption
  | EntityValidationOption
  | NbtValidationOption
  | NbtPathValidationOption
  | ObjectiveValidationOption
  | ResourceValidationOption
  | UuidValidationOption
  | VectorValidationOption

export type RelativePath = ('pop' | { push: string })[]

type BlockStateMapValidationOption = {
  validator: 'block_state_map',
  params: {
    id: RelativePath
  }
}

type CommandValidationOption = {
  validator: 'command',
  params: {
    leadingSlash?: boolean,
    allowPartial?: boolean
  }
}

type EntityValidationOption = {
  validator: 'entity',
  params: {
    amount: 'single' | 'multiple',
    type: 'players' | 'entities',
    isScoreHolder?: boolean
  }
}

type NbtValidationOption = {
  validator: 'nbt',
  params: {
    module?: string,
    registry?: {
      category: 'minecraft:block' | 'minecraft:entity' | 'minecraft:item',
      id: RelativePath,
    }
    isPredicate?: boolean
  }
}

type NbtPathValidationOption = {
  validator: 'nbt_path',
  params?: {
    category?: 'minecraft:block' | 'minecraft:entity' | 'minecraft:item',
    id?: string
  }
}

type ObjectiveValidationOption = {
  validator: 'objective',
  params?: {}
}

type ResourceValidationOption = {
  validator: 'resource',
  params: {
    pool: ResourceType | string[],
    allowTag?: boolean,
    allowUnknown?: boolean
  }
}

type UuidValidationOption = {
  validator: 'uuid',
  params?: {}
}

type VectorValidationOption = {
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

type ResourceType =
  | '$advancements'
  | '$dimensions'
  | '$functions'
  | '$loot_tables'
  | '$predicates'
  | '$recipes'
  | '$storages'
  | 'minecraft:block'
  | 'minecraft:entity'
  | 'minecraft:item'
  | 'minecraft:mob_effect'
  | 'minecraft:potion'
