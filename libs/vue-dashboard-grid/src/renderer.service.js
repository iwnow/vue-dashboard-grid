import { DomRenderer } from './dom-renderer';
import { GridType } from './const';

export class GridRendererService {
    /**
     * 
     * @param {import("./grid").GridBase} grid 
     */
    constructor(grid) {
        this.grid = grid;
    }
  
    destroy() {
      delete this.grid;
    }
  
    /**
     * 
     * @param {HTMLElement} el 
     * @param {import("./widget").WidgetConfig} item 
     * @param {DomRenderer} renderer 
     */
    updateItem(el, item, renderer) {
      if (this.grid.mobile) {
        this.clearCellPosition(renderer, el);
        if (this.grid.$options.keepFixedHeightInMobile) {
          renderer.setStyle(el, 'height', (item.rows * this.grid.$options.fixedRowHeight) + 'px');
        } else {
          renderer.setStyle(el, 'height',  (item.rows * this.grid.curWidth / item.cols ) + 'px');
        }
        if (this.grid.$options.keepFixedWidthInMobile) {
          renderer.setStyle(el, 'width', this.grid.$options.fixedColWidth + 'px');
        } else {
          renderer.setStyle(el, 'width', '');
        }
  
        renderer.setStyle(el, 'margin-bottom', this.grid.$options.margin + 'px');
        renderer.setStyle(el, 'margin-right', '');
      } else {
        const x = Math.round(this.grid.curColWidth * item.x);
        const y = Math.round(this.grid.curRowHeight * item.y);
        const width = this.grid.curColWidth * item.cols - this.grid.$options.margin;
        const height = (this.grid.curRowHeight * item.rows - this.grid.$options.margin);
        // set the cell style
        this.setCellPosition(renderer, el, x, y);
        renderer.setStyle(el, 'width', width + 'px');
        renderer.setStyle(el, 'height', height + 'px');
        let marginBottom = null;
        let marginRight = null;
        if (this.grid.$options.outerMargin) {
          if (this.grid.rows === item.rows + item.y) {
            if (this.grid.$options.outerMarginBottom !== null) {
              marginBottom = this.grid.$options.outerMarginBottom + 'px';
            } else {
              marginBottom = this.grid.$options.margin + 'px';
            }
          }
          if (this.grid.columns === item.cols + item.x) {
            if (this.grid.$options.outerMarginBottom !== null) {
              marginRight = this.grid.$options.outerMarginRight + 'px';
            } else {
              marginRight = this.grid.$options.margin + 'px';
            }
          }
        }
  
        renderer.setStyle(el, 'margin-bottom', marginBottom);
        renderer.setStyle(el, 'margin-right', marginRight);
      }
    }
  
    updateGridster() {
      let addClass = '';
      let removeClass1 = '';
      let removeClass2 = '';
      let removeClass3 = '';
      if (this.grid.$options.gridType === GridType.Fit) {
        addClass = GridType.Fit;
        removeClass1 = GridType.ScrollVertical;
        removeClass2 = GridType.ScrollHorizontal;
        removeClass3 = GridType.Fixed;
      } else if (this.grid.$options.gridType === GridType.ScrollVertical) {
        this.grid.curRowHeight = this.grid.curColWidth;
        addClass = GridType.ScrollVertical;
        removeClass1 = GridType.Fit;
        removeClass2 = GridType.ScrollHorizontal;
        removeClass3 = GridType.Fixed;
      } else if (this.grid.$options.gridType === GridType.ScrollHorizontal) {
        this.grid.curColWidth = this.grid.curRowHeight;
        addClass = GridType.ScrollHorizontal;
        removeClass1 = GridType.Fit;
        removeClass2 = GridType.ScrollVertical;
        removeClass3 = GridType.Fixed;
      } else if (this.grid.$options.gridType === GridType.Fixed) {
        this.grid.curColWidth = this.grid.$options.fixedColWidth +
          (this.grid.$options.ignoreMarginInRow ? 0 : this.grid.$options.margin);
        this.grid.curRowHeight = this.grid.$options.fixedRowHeight +
          (this.grid.$options.ignoreMarginInRow ? 0 : this.grid.$options.margin);
        addClass = GridType.Fixed;
        removeClass1 = GridType.Fit;
        removeClass2 = GridType.ScrollVertical;
        removeClass3 = GridType.ScrollHorizontal;
      } else if (this.grid.$options.gridType === GridType.VerticalFixed) {
        this.grid.curRowHeight = this.grid.$options.fixedRowHeight +
          (this.grid.$options.ignoreMarginInRow ? 0 : this.grid.$options.margin);
        addClass = GridType.ScrollVertical;
        removeClass1 = GridType.Fit;
        removeClass2 = GridType.ScrollHorizontal;
        removeClass3 = GridType.Fixed;
      } else if (this.grid.$options.gridType === GridType.HorizontalFixed) {
        this.grid.curColWidth = this.grid.$options.fixedColWidth +
          (this.grid.$options.ignoreMarginInRow ? 0 : this.grid.$options.margin);
        addClass = GridType.ScrollHorizontal;
        removeClass1 = GridType.Fit;
        removeClass2 = GridType.ScrollVertical;
        removeClass3 = GridType.Fixed;
      }
  
      if (this.grid.mobile) {
        this.grid.renderer.removeClass(this.grid.el, addClass);
      } else {
        this.grid.renderer.addClass(this.grid.el, addClass);
      }
      this.grid.renderer.removeClass(this.grid.el, removeClass1);
      this.grid.renderer.removeClass(this.grid.el, removeClass2);
      this.grid.renderer.removeClass(this.grid.el, removeClass3);
    }
  
    /**
     * @param {number} i 
     */
    getGridColumnStyle(i) {
      return {
        ...this.getLeftPosition(this.grid.curColWidth * i),
        width: this.grid.curColWidth - this.grid.$options.margin + 'px',
        height: this.grid.gridRows.length * this.grid.curRowHeight - this.grid.$options.margin + 'px'
      };
    }
  
    /**
     * @param {number} i 
     */
    getGridRowStyle(i) {
      return {
        ...this.getTopPosition(this.grid.curRowHeight * i),
        width: this.grid.gridColumns.length * this.grid.curColWidth - this.grid.$options.margin + 'px',
        height: this.grid.curRowHeight - this.grid.$options.margin + 'px'
      };
    }
  
    /**
     * @param {number} d
     * @returns {object}
     */
    getLeftPosition(d) {
      if (this.grid.$options.useTransformPositioning) {
        return {
          transform: 'translateX(' + d + 'px)',
        };
      } else {
        return {
          left: (this.getLeftMargin() + d) + 'px'
        };
      }
    }
  
    /**
     * @param {number} d
     * @returns {object}
     */
    getTopPosition(d) {
      if (this.grid.$options.useTransformPositioning) {
        return {
          transform: 'translateY(' + d + 'px)',
        };
      } else {
        return {
          top: this.getTopMargin() + d + 'px'
        };
      }
    }
  
    /**
     * 
     * @param {DomRenderer} renderer 
     * @param {HTMLElement} el 
     */
    clearCellPosition(renderer, el) {
      if (this.grid.$options.useTransformPositioning) {
        renderer.setStyle(el, 'transform', '');
      } else {
        renderer.setStyle(el, 'top', '');
        renderer.setStyle(el, 'left', '');
      }
    }
  
    /**
     * 
     * @param {DomRenderer} renderer 
     * @param {HTMLElement} el 
     * @param {number} x 
     * @param {number} y 
     */
    setCellPosition(renderer, el, x, y) {
      if (this.grid.$options.useTransformPositioning) {
        const transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        renderer.setStyle(el, 'transform', transform);
      } else {
        renderer.setStyle(el, 'left', this.getLeftMargin() + x + 'px');
        renderer.setStyle(el, 'top', this.getTopMargin() + y + 'px');
      }
    }
  
    getLeftMargin() {
      if (this.grid.$options.outerMargin) {
        if (this.grid.$options.outerMarginLeft !== null) {
          return this.grid.$options.outerMarginLeft;
        } else {
          return this.grid.$options.margin;
        }
      } else {
        return 0;
      }
    }
  
    getTopMargin() {
      if (this.grid.$options.outerMargin) {
        if (this.grid.$options.outerMarginTop !== null) {
          return this.grid.$options.outerMarginTop;
        } else {
          return this.grid.$options.margin;
        }
      } else {
        return 0;
      }
    }
}