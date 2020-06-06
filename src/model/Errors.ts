import { Path } from "./Path";

type PathError = {
  path: Path,
  error: string,
  params?: any[]
}

/**
 * Collects errors from data paths
 */
export class Errors implements Iterable<PathError> {
  private errors: PathError[] = []

  add(path: Path, error: string, ...params: any): false {
    this.errors.push({ path, error, params })
    return false
  }

  count() {
    return this.errors.length
  }

  *[Symbol.iterator]() {
    for (const e of this.errors) {
      yield e
    }
  }
}
