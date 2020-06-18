import { DataModel, ModelListener } from '../model/DataModel'
import { Path } from '../model/Path'
import { IView } from './View'

type SourceViewOptions = {
  indentation?: number | string,
  rows?: number
}

/**
 * JSON representation view of the model.
 * Renders the result in a <textarea>.
 */
export class SourceView implements ModelListener, IView {
  options?: SourceViewOptions
  target: HTMLTextAreaElement
  model: DataModel

  /**
   * @param model data model this view represents and listens to
   * @param target DOM element to render the view
   * @param options optional options for the view
   */
  constructor(model: DataModel, target: HTMLTextAreaElement, options?: SourceViewOptions) {
    this.model = model
    this.target = target
    this.options = options
    model.addListener(this)
    this.target.addEventListener('change', evt => this.updateModel())
  }

  setModel(newModel: DataModel) {
    this.model.removeListener(this)
    this.model = newModel
    this.model.addListener(this)
  }

  invalidated() {
    const transformed = this.model.schema.transform(new Path([], this.model), this.model.data, this)
    this.target.value = JSON.stringify(transformed, null, this.options?.indentation)
  }

  updateModel() {
    try {
      const parsed = JSON.parse(this.target.value)
      this.model.reset(parsed)
    } catch (err) {
      this.model.error(new Path(['JSON']), err.message)
    }
  }
}
