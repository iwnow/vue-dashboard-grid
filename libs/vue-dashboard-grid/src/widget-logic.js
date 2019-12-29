import { GridDragService } from "./drag.service";
import { GridResizeService } from "./resize.service";
import * as utils from './utils';
import { DomRenderer } from "./dom-renderer";

/**
 * @param {HTMLElement} el
 */
export function createWidgetInstance(el, grid, config) {
    
    const widget = new Widget(el, grid, config);
    widget.drag = new GridDragService(widget, grid);
    widget.resize = new GridResizeService(widget, grid);
    return widget;
}

export class Widget {
    /**
     * @param {HTMLElement} el
     */
    constructor(el,  gridster, config) {
        this.el = el;
        this.item = config;
        this.$item = {
            cols: -1,
            rows: -1,
            x: -1,
            y: -1,
        };
        this.gridster = gridster;
        this.drag = null;
        this.resize = null;
        this.top = null;
        this.left = null;
        this.width = null;
        this.height = null;
        this.notPlaced = null;
        this.init = null;
        this.renderer = new DomRenderer();
    }

    onInit() {
        this.updateOptions();
        this.gridster.addItem(this);
      }
    
      updateOptions() {
        this.$item = utils.merge(this.$item, this.item, {
          cols: undefined,
          rows: undefined,
          x: undefined,
          y: undefined,
          dragEnabled: undefined,
          resizeEnabled: undefined,
          compactEnabled: undefined,
          maxItemRows: undefined,
          minItemRows: undefined,
          maxItemCols: undefined,
          minItemCols: undefined,
          maxItemArea: undefined,
          minItemArea: undefined,
        });
      }
    
      onDestroy() {
        this.gridster.removeItem(this);
        delete this.gridster;
        this.drag.destroy();
        delete this.drag;
        this.resize.destroy();
        delete this.resize;
      }
    
      setSize() {
        this.renderer.setStyle(this.el, 'display', this.notPlaced ? '' : 'block');
        this.gridster.gridRenderer.updateItem(this.el, this.$item, this.renderer);
        this.updateItemSize();
      }
    
      updateItemSize() {
        const top = this.$item.y * this.gridster.curRowHeight;
        const left = this.$item.x * this.gridster.curColWidth;
        const width = this.$item.cols * this.gridster.curColWidth - this.gridster.$options.margin;
        const height = this.$item.rows * this.gridster.curRowHeight - this.gridster.$options.margin;
    
        if (!this.init && width > 0 && height > 0) {
          this.init = true;
          if (this.item.initCallback) {
            this.item.initCallback(this.item, this);
          }
          if (this.gridster.options.itemInitCallback) {
            this.gridster.options.itemInitCallback(this.item, this);
          }
          if (this.gridster.$options.scrollToNewItems) {
            this.el.scrollIntoView(false);
          }
        }
        if (width !== this.width || height !== this.height) {
          this.width = width;
          this.height = height;
          if (this.gridster.options.itemResizeCallback) {
            this.gridster.options.itemResizeCallback(this.item, this);
          }
        }
        this.top = top;
        this.left = left;
      }
    
      itemChanged() {
        if (this.gridster.options.itemChangeCallback) {
          this.gridster.options.itemChangeCallback(this.item, this);
        }
      }
    
      checkItemChanges(newValue, oldValue) {
        if (newValue.rows === oldValue.rows && newValue.cols === oldValue.cols && newValue.x === oldValue.x && newValue.y === oldValue.y) {
          return;
        }
        if (this.gridster.checkCollision(this.$item)) {
          this.$item.x = oldValue.x || 0;
          this.$item.y = oldValue.y || 0;
          this.$item.cols = oldValue.cols || 1;
          this.$item.rows = oldValue.rows || 1;
          this.setSize();
        } else {
          this.item.cols = this.$item.cols;
          this.item.rows = this.$item.rows;
          this.item.x = this.$item.x;
          this.item.y = this.$item.y;
          this.gridster.calculateLayoutDebounce();
          this.itemChanged();
        }
      }
    
      canBeDragged() {
        return !this.gridster.mobile &&
          (this.$item.dragEnabled === undefined ? this.gridster.$options.draggable.enabled : this.$item.dragEnabled);
      }
    
      canBeResized() {
        return !this.gridster.mobile &&
          (this.$item.resizeEnabled === undefined ? this.gridster.$options.resizable.enabled : this.$item.resizeEnabled);
      }
}