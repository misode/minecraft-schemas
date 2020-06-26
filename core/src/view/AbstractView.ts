import { ModelListener, DataModel } from "../model/DataModel";

export abstract class AbstractView implements ModelListener {
  model: DataModel

  constructor(model: DataModel) {
    this.model = model
    this.model.addListener(this)
  }

  setModel(model: DataModel) {
    this.model.removeListener(this)
    this.model = model
    this.model.addListener(this)
  }

  invalidated(model: DataModel): void {}
}
