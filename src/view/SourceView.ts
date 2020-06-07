import { DataModel } from '../model/DataModel'
import { Path } from '../model/Path'
import { AbstractView } from './AbstractView'

type SourceViewOptions = {
  indentation?: number | string,
  rows?: number
}

/**
 * JSON representation view of the model.
 * Renders the result in a <textarea>.
 */
export class SourceView extends AbstractView {
  options?: SourceViewOptions
  target: HTMLTextAreaElement

  /**
   * @param model data model this view represents and listens to
   * @param target DOM element to render the view
   * @param options optional options for the view
   */
  constructor(model: DataModel, target: HTMLTextAreaElement, options?: SourceViewOptions) {
    super(model, target)
    this.target = target
    this.options = options
    this.target.addEventListener('change', evt => this.updateModel())
  }

  /**
   * @override
   */
  render() {
    const transformed = this.model.schema.transform(new Path([], this.model), this.model.data, this)
    this.target.value = JSON.stringify(transformed, null, this.options?.indentation)
  }

  updateModel() {
    const parsed = JSON.parse(this.target.value)
    this.model.reset(parsed)
  }
}
