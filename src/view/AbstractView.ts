import { ModelListener, DataModel } from "../model/DataModel";

export interface IView extends ModelListener {
  render: () => void
  setModel: (model: DataModel) => void
}

export abstract class AbstractView implements IView {
  model: DataModel

  /**
   * @param model data model this view represents and listens to
   */
  constructor(model: DataModel) {
    this.model = model
    model.addListener(this)
  }

  /**
   * Updates the data model that this view represents
   * @param newModel updated data model
   */
  setModel(newModel: DataModel) {
    this.model.removeListener(this)
    this.model = newModel
    this.model.addListener(this)
  }

  /**
   * Renders this view to the target
   */
  abstract render(): void

  /**
   * Re-renders the view
   * @override
   */
  invalidated() {
    this.render()
  }
}
