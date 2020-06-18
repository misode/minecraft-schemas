import { DataModel } from "../model/DataModel";

export interface IView {
  setModel(model: DataModel): void
}
