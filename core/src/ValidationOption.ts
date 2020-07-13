export type ValidationOption =
  | BlockStateKeyValidationOption
  | BlockStateMapValidationOption
  | CommandValidationOption
  | EntityValidationOption
  | NbtValidationOption
  | NbtPathValidationOption
  | ObjectiveValidationOption
  | ResourceValidationOption
  | TeamValidationOption
  | UuidValidationOption
  | VectorValidationOption

export type RelativePath = ('pop' | { push: string })[]

type BlockStateKeyValidationOption = {
  validator: 'block_state_key',
  params: {
    id: RelativePath
  }
}

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
      id?: RelativePath,
    }
    isPredicate?: boolean
  }
}

type NbtPathValidationOption = {
  validator: 'nbt_path',
  params?: {
    category: 'minecraft:block' | 'minecraft:entity' | 'minecraft:item',
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

type TeamValidationOption = {
  validator: 'team',
  params?: {}
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
  | '$advancement'
  | '$dimension'
  | '$function'
  | '$loot_table'
  | '$predicate'
  | '$recipe'
  | '$storage'
  | '$tag/block'
  | '$tag/fluid'
  | '$tag/item'
  | '$worldgen/biome'
  | '$worldgen/feature'
  | 'minecraft:attribute'
  | 'minecraft:block'
  | 'minecraft:custom_stat'
  | 'minecraft:enchantment'
  | 'minecraft:entity'
  | 'minecraft:fluid'
  | 'minecraft:item'
  | 'minecraft:loot_condition_type'
  | 'minecraft:loot_function_type'
  | 'minecraft:loot_pool_entry_type'
  | 'minecraft:mob_effect'
  | 'minecraft:potion'
  | 'minecraft:stat_type'
  | 'minecraft:worldgen/biome_source'
  | 'minecraft:worldgen/chunk_generator'
