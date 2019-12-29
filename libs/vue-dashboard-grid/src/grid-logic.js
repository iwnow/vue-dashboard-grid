import { DomRenderer } from "./dom-renderer";
import { GridRendererService } from "./renderer.service";
import * as utils from './utils';
import { createGridConfigDefault } from './const';
import { GridEmptyCellService } from "./empty-cell.service";
import { GridCompactService } from "./compact.service";

/**
 * @param {HTMLElement} el
 */
export function createGridInstance(el) {
    
    const grid = new Grid(el);
    grid.$options = utils.copy(createGridConfigDefault());
    grid.gridRenderer = new GridRendererService(grid);
    grid.emptyCell = new GridEmptyCellService(grid);
    grid.compact = new GridCompactService(grid);
    grid.calculateLayoutDebounce = utils.debounce(grid.calculateLayout.bind(grid), 300);
    return grid;
}

export class Grid {
    /**
     * @param {HTMLElement} el
     */
    constructor(el) {
        this.renderer = new DomRenderer();
        /**@type {HTMLElement} */
        this.el = el;
        this.columns = 0;
        this.rows = 0;
        this.gridColumns = [];
        this.gridRows = [];
        /**@type {GridRendererService} */
        this.gridRenderer = null;
        /**@type {import("./grid-types").GridConfig} */
        this.options = null;
        /**@type {import("./grid-types").GridConfig} */
        this.$options = null;
        this.mobile = false;
        this.curWidth = 0;
        this.curHeight = 0;
        this.grid = [];
        this.curColWidth = 0;
        this.curRowHeight = 0;
        this.dragInProgress = false;
        /**@type {GridEmptyCellService} */
        this.emptyCell = null;
        /**@type {GridCompactService} */
        this.compact = null;
        /**@type {() => void} */
        this.calculateLayoutDebounce = null;
        /**@type {() => void} */
        this.windowResize = null;
    }

    onInit() {
        if (this.options.initCallback) {
            this.options.initCallback(this);
        }
    }

    onOptionChanged(options) {
        this.options = options;
        this.setOptions();
        this.options.api = {
            optionsChanged: this.optionsChanged.bind(this),
            resize: this.onResize.bind(this),
            getNextPossiblePosition: this.getNextPossiblePosition.bind(this),
            getFirstPossiblePosition: this.getFirstPossiblePosition.bind(this),
            getLastPossiblePosition: this.getLastPossiblePosition.bind(this),
        };
        this.columns = this.$options.minCols;
        this.rows = this.$options.minRows;
        this.setGridSize();
        this.calculateLayout();
    }

    optionsChanged() {
        this.setOptions();
        let widgetsIndex = this.grid.length - 1, widget;
        for (; widgetsIndex >= 0; widgetsIndex--) {
            widget = this.grid[widgetsIndex];
            widget.updateOptions();
        }
        this.calculateLayout();
    }

    onDestroy() {
        if (this.windowResize) {
            this.windowResize();
        }
        if (this.options && this.options.destroyCallback) {
            this.options.destroyCallback(this);
        }
        if (this.options && this.options.api) {
            this.options.api.resize = undefined;
            this.options.api.optionsChanged = undefined;
            this.options.api.getNextPossiblePosition = undefined;
            this.options.api = undefined;
        }
        this.emptyCell.destroy();
        delete this.emptyCell;
        this.compact.destroy();
        delete this.compact;
    }

    setOptions() {
        this.$options = utils.merge(this.$options, this.options, this.$options);
        if (!this.$options.disableWindowResize && !this.windowResize) {
        const debouncedResize = utils.debounce(this.onResize.bind(this), 300);
          this.windowResize = this.renderer.listen('window', 'resize', debouncedResize, { passive: true });
        } else if (this.$options.disableWindowResize && this.windowResize) {
          this.windowResize();
          this.windowResize = null;
        }
        this.emptyCell.updateOptions();
      }

      resize() {
        let height;
        let width;
        if (this.$options.gridType === 'fit' && !this.mobile) {
          width = this.el.offsetWidth;
          height = this.el.offsetHeight;
        } else {
          width = this.el.clientWidth;
          height = this.el.clientHeight;
        }
        if ((width !== this.curWidth || height !== this.curHeight) && this.checkIfToResize()) {
          this.onResize();
        }
      }

      onResize() {
        this.setGridSize();
        this.calculateLayout();
      }
    
      checkIfToResize() {
        const clientWidth = this.el.clientWidth;
        const offsetWidth = this.el.offsetWidth;
        const scrollWidth = this.el.scrollWidth;
        const clientHeight = this.el.clientHeight;
        const offsetHeight = this.el.offsetHeight;
        const scrollHeight = this.el.scrollHeight;
        const verticalScrollPresent = clientWidth < offsetWidth && scrollHeight > offsetHeight
          && scrollHeight - offsetHeight < offsetWidth - clientWidth;
        const horizontalScrollPresent = clientHeight < offsetHeight
          && scrollWidth > offsetWidth && scrollWidth - offsetWidth < offsetHeight - clientHeight;
        if (verticalScrollPresent) {
          return false;
        }
        return !horizontalScrollPresent;
      }
    
      setGridSize() {
        const el = this.el;
        let width = el.clientWidth;
        let height = el.clientHeight;
        if (this.$options.setGridSize || this.$options.gridType === 'fit' && !this.mobile) {
          width = el.offsetWidth;
          height = el.offsetHeight;
        } else {
          width = el.clientWidth;
          height = el.clientHeight;
        }
        this.curWidth = width;
        this.curHeight = height;
      }
    
      setGridDimensions() {
        this.setGridSize();
        if (!this.mobile && this.$options.mobileBreakpoint > this.curWidth) {
          this.mobile = !this.mobile;
          this.renderer.addClass(this.el, 'mobile');
        } else if (this.mobile && this.$options.mobileBreakpoint < this.curWidth) {
          this.mobile = !this.mobile;
          this.renderer.removeClass(this.el, 'mobile');
        }
        let rows = this.$options.minRows, columns = this.$options.minCols;
    
        let widgetsIndex = this.grid.length - 1, widget;
        for (; widgetsIndex >= 0; widgetsIndex--) {
          widget = this.grid[widgetsIndex];
          if (!widget.notPlaced) {
            rows = Math.max(rows, widget.$item.y + widget.$item.rows);
            columns = Math.max(columns, widget.$item.x + widget.$item.cols);
          }
        }
    
        if (this.columns !== columns || this.rows !== rows) {
          this.columns = columns;
          this.rows = rows;
          if (this.options.gridSizeChangedCallback) {
            this.options.gridSizeChangedCallback(this);
          }
        }
      }
    
      calculateLayout() {
        if (this.compact) {
          this.compact.checkCompact();
        }
    
        this.setGridDimensions();
        if (this.$options.outerMargin) {
          let marginWidth = -this.$options.margin;
          if (this.$options.outerMarginLeft !== null) {
            marginWidth += this.$options.outerMarginLeft;
            this.renderer.setStyle(this.el, 'padding-left', this.$options.outerMarginLeft + 'px');
          } else {
            marginWidth += this.$options.margin;
            this.renderer.setStyle(this.el, 'padding-left', this.$options.margin + 'px');
          }
          if (this.$options.outerMarginRight !== null) {
            marginWidth += this.$options.outerMarginRight;
            this.renderer.setStyle(this.el, 'padding-right', this.$options.outerMarginRight + 'px');
          } else {
            marginWidth += this.$options.margin;
            this.renderer.setStyle(this.el, 'padding-right', this.$options.margin + 'px');
          }
          this.curColWidth = (this.curWidth - marginWidth) / this.columns;
          let marginHeight = -this.$options.margin;
          if (this.$options.outerMarginTop !== null) {
            marginHeight += this.$options.outerMarginTop;
            this.renderer.setStyle(this.el, 'padding-top', this.$options.outerMarginTop + 'px');
          } else {
            marginHeight += this.$options.margin;
            this.renderer.setStyle(this.el, 'padding-top', this.$options.margin + 'px');
          }
          if (this.$options.outerMarginBottom !== null) {
            marginHeight += this.$options.outerMarginBottom;
            this.renderer.setStyle(this.el, 'padding-bottom', this.$options.outerMarginBottom + 'px');
          } else {
            marginHeight += this.$options.margin;
            this.renderer.setStyle(this.el, 'padding-bottom', this.$options.margin + 'px');
          }
          this.curRowHeight = (this.curHeight - marginHeight) / this.rows;
        } else {
          this.curColWidth = (this.curWidth + this.$options.margin) / this.columns;
          this.curRowHeight = (this.curHeight + this.$options.margin) / this.rows;
          this.renderer.setStyle(this.el, 'padding-left', 0 + 'px');
          this.renderer.setStyle(this.el, 'padding-right', 0 + 'px');
          this.renderer.setStyle(this.el, 'padding-top', 0 + 'px');
          this.renderer.setStyle(this.el, 'padding-bottom', 0 + 'px');
        }
        this.gridRenderer.updateGridster();
    
        this.updateGrid();
    
        if (this.$options.setGridSize) {
          this.renderer.setStyle(this.el, 'width', (this.columns * this.curColWidth + this.$options.margin) + 'px');
          this.renderer.setStyle(this.el, 'height', (this.rows * this.curRowHeight + this.$options.margin) + 'px');
        } else {
          this.renderer.setStyle(this.el, 'width', '');
          this.renderer.setStyle(this.el, 'height', '');
        }
    
        let widgetsIndex = this.grid.length - 1, widget;
        for (; widgetsIndex >= 0; widgetsIndex--) {
          widget = this.grid[widgetsIndex];
          widget.setSize();
          widget.drag.toggle();
          widget.resize.toggle();
        }
    
        setTimeout(this.resize.bind(this), 100);
      }
    
      updateGrid() {
        if (this.$options.displayGrid === 'always' && !this.mobile) {
            this.renderer.addClass(this.el, 'display-grid');
          } else if (this.$options.displayGrid === 'onDrag&Resize' && this.dragInProgress) {
            this.renderer.addClass(this.el, 'display-grid');
          } else if (this.$options.displayGrid === 'none' || !this.dragInProgress || this.mobile) {
            this.renderer.removeClass(this.el, 'display-grid');
          }
          this.setGridDimensions();
          const colsLen = Math.max(this.columns, Math.floor(this.curWidth / this.curColWidth)) || 0;
          const rowsLen = Math.max(this.rows, Math.floor(this.curHeight / this.curRowHeight)) || 0;
          this.gridColumns.length = colsLen;
          this.gridRows.length = rowsLen;
      }
    
      addItem(itemComponent) {
        if (itemComponent.$item.cols === undefined) {
          itemComponent.$item.cols = this.$options.defaultItemCols;
          itemComponent.item.cols = itemComponent.$item.cols;
          itemComponent.itemChanged();
        }
        if (itemComponent.$item.rows === undefined) {
          itemComponent.$item.rows = this.$options.defaultItemRows;
          itemComponent.item.rows = itemComponent.$item.rows;
          itemComponent.itemChanged();
        }
        if (itemComponent.$item.x === -1 || itemComponent.$item.y === -1) {
          this.autoPositionItem(itemComponent);
        } else if (this.checkCollision(itemComponent.$item)) {
          if (!this.$options.disableWarnings) {
            itemComponent.notPlaced = true;
            console.warn('Can\'t be placed in the bounds of the dashboard, trying to auto position!/n' +
              JSON.stringify(itemComponent.item, ['cols', 'rows', 'x', 'y']));
          }
          if (!this.$options.disableAutoPositionOnConflict) {
            this.autoPositionItem(itemComponent);
          } else {
            itemComponent.notPlaced = true;
          }
        }
        this.grid.push(itemComponent);
        this.calculateLayoutDebounce();
      }
    
      removeItem(itemComponent) {
        this.grid.splice(this.grid.indexOf(itemComponent), 1);
        this.calculateLayoutDebounce();
        if (this.options.itemRemovedCallback) {
          this.options.itemRemovedCallback(itemComponent.item, itemComponent);
        }
      }
    
      /**
       * @param {import("./widget").WidgetConfig} item 
       */
      checkCollision(item) {
        let collision = false;
        if (this.options.itemValidateCallback) {
          collision = !this.options.itemValidateCallback(item);
        }
        if (!collision && this.checkGridCollision(item)) {
          collision = true;
        }
        if (!collision) {
          const c = this.findItemWithItem(item);
          if (c) {
            collision = c;
          }
        }
        return collision;
      }
    
    
      /**
       * 
       * @param {import("./widget").WidgetConfig} item 
       */
      checkGridCollision(item) {
        const noNegativePosition = item.y > -1 && item.x > -1;
        const maxGridCols = item.cols + item.x <= this.$options.maxCols;
        const maxGridRows = item.rows + item.y <= this.$options.maxRows;
        const maxItemCols = item.maxItemCols === undefined ? this.$options.maxItemCols : item.maxItemCols;
        const minItemCols = item.minItemCols === undefined ? this.$options.minItemCols : item.minItemCols;
        const maxItemRows = item.maxItemRows === undefined ? this.$options.maxItemRows : item.maxItemRows;
        const minItemRows = item.minItemRows === undefined ? this.$options.minItemRows : item.minItemRows;
        const inColsLimits = item.cols <= maxItemCols && item.cols >= minItemCols;
        const inRowsLimits = item.rows <= maxItemRows && item.rows >= minItemRows;
        const minAreaLimit = item.minItemArea === undefined ? this.$options.minItemArea : item.minItemArea;
        const maxAreaLimit = item.maxItemArea === undefined ? this.$options.maxItemArea : item.maxItemArea;
        const area = item.cols * item.rows;
        const inMinArea = minAreaLimit <= area;
        const inMaxArea = maxAreaLimit >= area;
        return !(noNegativePosition && maxGridCols && maxGridRows && inColsLimits && inRowsLimits && inMinArea && inMaxArea);
      }
    
      /**
       * 
       * @param {import("./widget").WidgetConfig} item 
       */
      findItemWithItem(item) {
        let widgetsIndex = this.grid.length - 1, widget;
        for (; widgetsIndex > -1; widgetsIndex--) {
          widget = this.grid[widgetsIndex];
          if (widget.$item !== item && checkCollisionTwoItems(widget.$item, item)) {
            return widget;
          }
        }
        return false;
      }
    
    /**
       * 
       * @param {import("./widget").WidgetConfig} item 
       */
      findItemsWithItem(item) {
        const a = [];
        let widgetsIndex = this.grid.length - 1, widget;
        for (; widgetsIndex > -1; widgetsIndex--) {
          widget = this.grid[widgetsIndex];
          if (widget.$item !== item && checkCollisionTwoItems(widget.$item, item)) {
            a.push(widget);
          }
        }
        return a;
      }
    
    
    
      autoPositionItem(itemComponent) {
        if (this.getNextPossiblePosition(itemComponent.$item)) {
          itemComponent.notPlaced = false;
          itemComponent.item.x = itemComponent.$item.x;
          itemComponent.item.y = itemComponent.$item.y;
          itemComponent.itemChanged();
        } else {
          itemComponent.notPlaced = true;
          if (!this.$options.disableWarnings) {
            console.warn('Can\'t be placed in the bounds of the dashboard!/n' +
              JSON.stringify(itemComponent.item, ['cols', 'rows', 'x', 'y']));
          }
        }
      }
    
      getNextPossiblePosition(newItem, startingFrom = {}) {
        if (newItem.cols === -1) {
          newItem.cols = this.$options.defaultItemCols;
        }
        if (newItem.rows === -1) {
          newItem.rows = this.$options.defaultItemRows;
        }
        this.setGridDimensions();
        let rowsIndex = startingFrom.y || 0, colsIndex;
        for (; rowsIndex < this.rows; rowsIndex++) {
          newItem.y = rowsIndex;
          colsIndex = startingFrom.x || 0;
          for (; colsIndex < this.columns; colsIndex++) {
            newItem.x = colsIndex;
            if (!this.checkCollision(newItem)) {
              return true;
            }
          }
        }
        const canAddToRows = this.$options.maxRows >= this.rows + newItem.rows;
        const canAddToColumns = this.$options.maxCols >= this.columns + newItem.cols;
        const addToRows = this.rows <= this.columns && canAddToRows;
        if (!addToRows && canAddToColumns) {
          newItem.x = this.columns;
          newItem.y = 0;
          return true;
        } else if (canAddToRows) {
          newItem.y = this.rows;
          newItem.x = 0;
          return true;
        }
        return false;
      }
    
      getFirstPossiblePosition(item) {
        const tmpItem = Object.assign({}, item);
        this.getNextPossiblePosition(tmpItem);
        return tmpItem;
      }
    
      getLastPossiblePosition(item) {
        let farthestItem = {y: 0, x: 0};
        farthestItem = this.grid.reduce((prev, curr) => {
          const currCoords = {y: curr.$item.y + curr.$item.rows - 1, x: curr.$item.x + curr.$item.cols - 1};
          if (utils.compareItems(prev, currCoords) === 1) {
            return currCoords;
          } else {
            return prev;
          }
        }, farthestItem);
    
        const tmpItem = Object.assign({}, item);
        this.getNextPossiblePosition(tmpItem, farthestItem);
        return tmpItem;
      }
    
      pixelsToPositionX(x, roundingMethod, noLimit) {
        const position = roundingMethod(x / this.curColWidth);
        if (noLimit) {
          return position;
        } else {
          return Math.max(position, 0);
        }
      }
    
      pixelsToPositionY(y, roundingMethod, noLimit) {
        const position = roundingMethod(y / this.curRowHeight);
        if (noLimit) {
          return position;
        } else {
          return Math.max(position, 0);
        }
      }
    
      positionXToPixels(x) {
        return x * this.curColWidth;
      }
    
      positionYToPixels(y) {
        return y * this.curRowHeight;
      }
    
      
}

// ------ Functions for swapWhileDragging option
    
      // identical to checkCollision() except that here we add bondaries. 
      function checkCollisionTwoItemsForSwaping(item, item2) {
        // if the cols or rows of the items are 1 , doesnt make any sense to set a boundary. Only if the item is bigger we set a boundary
        const horizontalBoundaryItem1 = item.cols === 1 ? 0 : 1;
        const horizontalBoundaryItem2 = item2.cols === 1 ? 0 : 1;
        const verticalBoundaryItem1 = item.rows === 1 ? 0 : 1;
        const verticalBoundaryItem2 = item2.rows === 1 ? 0 : 1;
        return item.x + horizontalBoundaryItem1 < item2.x + item2.cols
          && item.x + item.cols > item2.x + horizontalBoundaryItem2
          && item.y + verticalBoundaryItem1 < item2.y + item2.rows
          && item.y + item.rows > item2.y + verticalBoundaryItem2;
      }
    
      // identical to checkCollision() except that this function calls findItemWithItemForSwaping() instead of findItemWithItem()
      function checkCollisionForSwaping(item) {
        let collision = false;
        if (this.options.itemValidateCallback) {
          collision = !this.options.itemValidateCallback(item);
        }
        if (!collision && this.checkGridCollision(item)) {
          collision = true;
        }
        if (!collision) {
          const c = this.findItemWithItemForSwaping(item);
          if (c) {
            collision = c;
          }
        }
        return collision;
      }
    
      function findItemWithItemForSwaping(item) {
        let widgetsIndex = this.grid.length - 1, widget;
        for (; widgetsIndex > -1; widgetsIndex--) {
          widget = this.grid[widgetsIndex];
          if (widget.$item !== item && checkCollisionTwoItemsForSwaping(widget.$item, item)) {
            return widget;
          }
        }
        return false;
      }

      function checkCollisionTwoItems(item, item2) {
        return item.x < item2.x + item2.cols
          && item.x + item.cols > item2.x
          && item.y < item2.y + item2.rows
          && item.y + item.rows > item2.y;
      }