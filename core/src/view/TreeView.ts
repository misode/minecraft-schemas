import { DataModel } from '../model/DataModel'
import { ModelPath } from '../model/Path'
import { AbstractView } from './AbstractView'
import { hexId } from '../utils'

type Registry = {
  [id: string]: (el: Element) => void
}

type TreeViewOptions = {
  showErrors?: boolean
  observer?: (el: HTMLElement) => void
  nodeInjector?: (path: ModelPath, view: TreeView) => string
}

/**
 * DOM representation view of the model.
 */
export class TreeView extends AbstractView {
  target: HTMLElement
  registry: Registry = {}
  showErrors: boolean
  observer: (el: HTMLElement) => void
  nodeInjector: (path: ModelPath, view: TreeView) => string

  /**
   * @param model data model this view represents and listens to
   * @param target DOM element to render the view
   */
  constructor(model: DataModel, target: HTMLElement, options?: TreeViewOptions) {
    super(model)
    this.target = target
    this.showErrors = options?.showErrors ?? false
    this.observer = options?.observer ?? (() => {})
    this.nodeInjector = options?.nodeInjector ?? (() => '')
  }

  /**
   * Registers a callback and gives an ID
   * @param callback function that is called when the element is mounted
   * @returns the ID that should be applied to the data-id attribute
   */
  register(callback: (el: Element) => void): string {
    const id = hexId()
    this.registry[id] = callback
    return id
  }

  /**
   * Registers an event and gives an ID
   * @param type event type
   * @param callback function that is called when the event is fired
   * @returns the ID that should be applied to the data-id attribute
   */
  registerEvent(type: string, callback: (el: Element) => void): string {
    return this.register(el => {
      el.addEventListener(type, evt => {
        callback(el)
        evt.stopPropagation()
      })
    })
  }

  /**
   * Registers a change event and gives an ID
   * @param callback function that is called when the event is fired
   * @returns the ID that should be applied to the data-id attribute
   */
  registerChange(callback: (el: Element) => void): string {
    return this.registerEvent('change', callback)
  }

  /**
   * Registers a click event and gives an ID
   * @param callback function that is called when the event is fired
   * @returns the ID that should be applied to the data-id attribute
   */
  registerClick(callback: (el: Element) => void): string {
    return this.registerEvent('click', callback)
  }

  /**
   * @override
   */
  invalidated() {
    this.target.innerHTML = this.model.schema.render(
      new ModelPath(this.model), this.model.data, this, {hideHeader: true})
    for (const id in this.registry) {
      const element = this.target.querySelector(`[data-id="${id}"]`)
      if (element !== null) this.registry[id](element)
    }
    this.registry = {}
    this.observer(this.target)
  }
}
