import { Path } from './model/Path'

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

export type BlockStateMapValidationOption = {
  validator: 'block_state_map',
  params: {
    id: (path: Path) => Path
  }
}

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
    module?: string,
    registry?: {
      category: 'minecraft:block' | 'minecraft:entity' | 'minecraft:item',
      id: (path: Path) => Path,
    }
    isPredicate?: boolean
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

export type ResourceValidationOption = {
  validator: 'resource',
  params: {
    pool: ResourceType | string[],
    allowTag?: boolean,
    allowUnknown?: boolean
  }
}

export type UuidValidationOption = {
  validator: 'uuid',
  params?: {}
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
