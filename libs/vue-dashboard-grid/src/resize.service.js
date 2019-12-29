import * as utils from './utils';
import { GridPushService } from './push.service';
import { GridPushResizeService } from './push-resize.service';
import { cancelScroll, scroll } from './scroll.service';

export class GridResizeService {
    constructor(gridsterItem, gridster) {
        this.gridsterItem = gridsterItem;
        this.gridster = gridster;
        this.lastMouse = {
          clientX: 0,
          clientY: 0
        };
        this.itemBackup = [0, 0, 0, 0];
        this.resizeEventScrollType = {w: false, e: false, n: false, s: false};
      }

      destroy() {
        if (this.gridster.previewStyle) {
          this.gridster.previewStyle();
        }
        delete this.gridsterItem;
        delete this.gridster;
      }
    
      dragStart(e) {
        switch (e.which) {
          case 1:
            // left mouse button
            break;
          case 2:
          case 3:
            // right or middle mouse button
            return;
        }
        if (this.gridster.options.resizable && this.gridster.options.resizable.start) {
          this.gridster.options.resizable.start(this.gridsterItem.item, this.gridsterItem, e);
        }
        e.stopPropagation();
        e.preventDefault();
        this.dragFunction = this.dragMove.bind(this);
        this.dragStopFunction = this.dragStop.bind(this);
        this.zone.runOutsideAngular(() => {
          this.mousemove = this.gridsterItem.renderer.listen('document', 'mousemove', this.dragFunction);
          this.touchmove = this.gridster.renderer.listen(this.gridster.el, 'touchmove', this.dragFunction);
        });
        this.mouseup = this.gridsterItem.renderer.listen('document', 'mouseup', this.dragStopFunction);
        this.mouseleave = this.gridsterItem.renderer.listen('document', 'mouseleave', this.dragStopFunction);
        this.cancelOnBlur = this.gridsterItem.renderer.listen('window', 'blur', this.dragStopFunction);
        this.touchend = this.gridsterItem.renderer.listen('document', 'touchend', this.dragStopFunction);
        this.touchcancel = this.gridsterItem.renderer.listen('document', 'touchcancel', this.dragStopFunction);
    
        this.gridsterItem.renderer.addClass(this.gridsterItem.el, 'dgrid-item-resizing');
        this.lastMouse.clientX = e.clientX;
        this.lastMouse.clientY = e.clientY;
        this.left = this.gridsterItem.left;
        this.top = this.gridsterItem.top;
        this.width = this.gridsterItem.width;
        this.height = this.gridsterItem.height;
        this.bottom = this.gridsterItem.top + this.gridsterItem.height;
        this.right = this.gridsterItem.left + this.gridsterItem.width;
        this.margin = this.gridster.$options.margin;
        this.offsetLeft = this.gridster.el.scrollLeft - this.gridster.el.offsetLeft;
        this.offsetTop = this.gridster.el.scrollTop - this.gridster.el.offsetTop;
        this.diffLeft = e.clientX + this.offsetLeft - this.left;
        this.diffRight = e.clientX + this.offsetLeft - this.right;
        this.diffTop = e.clientY + this.offsetTop - this.top;
        this.diffBottom = e.clientY + this.offsetTop - this.bottom;
        this.minHeight = this.gridster.positionYToPixels(this.gridsterItem.$item.minItemRows || this.gridster.$options.minItemRows)
          - this.margin;
        this.minWidth = this.gridster.positionXToPixels(this.gridsterItem.$item.minItemCols || this.gridster.$options.minItemCols)
          - this.margin;
        this.gridster.movingItem = this.gridsterItem.$item;
        this.gridster.previewStyle();
        this.push = new GridPushService(this.gridsterItem);
        this.pushResize = new GridPushResizeService(this.gridsterItem);
        this.gridster.dragInProgress = true;
        this.gridster.updateGrid();
    
        if (e.target.classList.contains('handle-n')) {
          this.resizeEventScrollType.n = true;
          this.directionFunction = this.handleN;
        } else if (e.target.classList.contains('handle-w')) {
          this.resizeEventScrollType.w = true;
          this.directionFunction = this.handleW;
        } else if (e.target.classList.contains('handle-s')) {
          this.resizeEventScrollType.s = true;
          this.directionFunction = this.handleS;
        } else if (e.target.classList.contains('handle-e')) {
          this.resizeEventScrollType.e = true;
          this.directionFunction = this.handleE;
        } else if (e.target.classList.contains('handle-nw')) {
          this.resizeEventScrollType.n = true;
          this.resizeEventScrollType.w = true;
          this.directionFunction = this.handleNW;
        } else if (e.target.classList.contains('handle-ne')) {
          this.resizeEventScrollType.n = true;
          this.resizeEventScrollType.e = true;
          this.directionFunction = this.handleNE;
        } else if (e.target.classList.contains('handle-sw')) {
          this.resizeEventScrollType.s = true;
          this.resizeEventScrollType.w = true;
          this.directionFunction = this.handleSW;
        } else if (e.target.classList.contains('handle-se')) {
          this.resizeEventScrollType.s = true;
          this.resizeEventScrollType.e = true;
          this.directionFunction = this.handleSE;
        }
      }
    
      dragMove(e) {
        e.stopPropagation();
        e.preventDefault();
        utils.checkTouchEvent(e);
        this.offsetTop = this.gridster.el.scrollTop - this.gridster.el.offsetTop;
        this.offsetLeft = this.gridster.el.scrollLeft - this.gridster.el.offsetLeft;
        scroll(this.gridster, this.left, this.top, this.width, this.height, e, this.lastMouse, this.directionFunction.bind(this), true,
          this.resizeEventScrollType);
        this.directionFunction(e);
    
        this.lastMouse.clientX = e.clientX;
        this.lastMouse.clientY = e.clientY;
        this.zone.run(() => {
          this.gridster.updateGrid();
        });
      }
    
      dragStop(e) {
        e.stopPropagation();
        e.preventDefault();
        cancelScroll();
        this.mousemove();
        this.mouseup();
        this.mouseleave();
        this.cancelOnBlur();
        this.touchmove();
        this.touchend();
        this.touchcancel();
        this.gridster.dragInProgress = false;
        this.gridster.updateGrid();
        if (this.gridster.options.resizable && this.gridster.options.resizable.stop) {
          Promise.resolve(this.gridster.options.resizable.stop(this.gridsterItem.item, this.gridsterItem, e))
            .then(this.makeResize.bind(this), this.cancelResize.bind(this));
        } else {
          this.makeResize();
        }
        setTimeout(() => {
          this.gridsterItem.renderer.removeClass(this.gridsterItem.el, 'dgrid-item-resizing');
          if (this.gridster) {
            this.gridster.movingItem = null;
            this.gridster.previewStyle();
          }
        });
      }
    
      cancelResize() {
        this.gridsterItem.$item.cols = this.gridsterItem.item.cols || 1;
        this.gridsterItem.$item.rows = this.gridsterItem.item.rows || 1;
        this.gridsterItem.$item.x = this.gridsterItem.item.x || 0;
        this.gridsterItem.$item.y = this.gridsterItem.item.y || 0;
        this.gridsterItem.setSize();
        this.push.restoreItems();
        this.pushResize.restoreItems();
        this.push.destroy();
        delete this.push;
        this.pushResize.destroy();
        delete this.pushResize;
      }
    
      makeResize() {
        this.gridsterItem.setSize();
        this.gridsterItem.checkItemChanges(this.gridsterItem.$item, this.gridsterItem.item);
        this.push.setPushedItems();
        this.pushResize.setPushedItems();
        this.push.destroy();
        delete this.push;
        this.pushResize.destroy();
        delete this.pushResize;
      }
    
      handleN(e) {
        this.top = e.clientY + this.offsetTop - this.diffTop;
        this.height = this.bottom - this.top;
        if (this.minHeight > this.height) {
          this.height = this.minHeight;
          this.top = this.bottom - this.minHeight;
        }
        this.newPosition = this.gridster.pixelsToPositionY(this.top + this.margin, Math.floor);
        if (this.gridsterItem.$item.y !== this.newPosition) {
          this.itemBackup[1] = this.gridsterItem.$item.y;
          this.itemBackup[3] = this.gridsterItem.$item.rows;
          this.gridsterItem.$item.rows += this.gridsterItem.$item.y - this.newPosition;
          this.gridsterItem.$item.y = this.newPosition;
          this.pushResize.pushItems(this.pushResize.fromSouth);
          this.push.pushItems(this.push.fromSouth, this.gridster.$options.disablePushOnResize);
          if (this.gridster.checkCollision(this.gridsterItem.$item)) {
            this.gridsterItem.$item.y = this.itemBackup[1];
            this.gridsterItem.$item.rows = this.itemBackup[3];
            this.setItemTop(this.gridster.positionYToPixels(this.gridsterItem.$item.y));
            this.setItemHeight(this.gridster.positionYToPixels(this.gridsterItem.$item.rows) - this.margin);
            return;
          } else {
            this.gridster.previewStyle();
          }
          this.pushResize.checkPushBack();
          this.push.checkPushBack();
        }
        this.setItemTop(this.top);
        this.setItemHeight(this.height);
      }
    
      handleW(e) {
        this.left = e.clientX + this.offsetLeft - this.diffLeft;
        this.width = this.right - this.left;
        if (this.minWidth > this.width) {
          this.width = this.minWidth;
          this.left = this.right - this.minWidth;
        }
        this.newPosition = this.gridster.pixelsToPositionX(this.left + this.margin, Math.floor);
        if (this.gridsterItem.$item.x !== this.newPosition) {
          this.itemBackup[0] = this.gridsterItem.$item.x;
          this.itemBackup[2] = this.gridsterItem.$item.cols;
          this.gridsterItem.$item.cols += this.gridsterItem.$item.x - this.newPosition;
          this.gridsterItem.$item.x = this.newPosition;
          this.pushResize.pushItems(this.pushResize.fromEast);
          this.push.pushItems(this.push.fromEast, this.gridster.$options.disablePushOnResize);
          if (this.gridster.checkCollision(this.gridsterItem.$item)) {
            this.gridsterItem.$item.x = this.itemBackup[0];
            this.gridsterItem.$item.cols = this.itemBackup[2];
            this.setItemLeft(this.gridster.positionXToPixels(this.gridsterItem.$item.x));
            this.setItemWidth(this.gridster.positionXToPixels(this.gridsterItem.$item.cols) - this.margin);
            return;
          } else {
            this.gridster.previewStyle();
          }
          this.pushResize.checkPushBack();
          this.push.checkPushBack();
        }
        this.setItemLeft(this.left);
        this.setItemWidth(this.width);
      }
    
      handleS(e) {
        this.height = e.clientY + this.offsetTop - this.diffBottom - this.top;
        if (this.minHeight > this.height) {
          this.height = this.minHeight;
        }
        this.bottom = this.top + this.height;
        this.newPosition = this.gridster.pixelsToPositionY(this.bottom, Math.ceil);
        if ((this.gridsterItem.$item.y + this.gridsterItem.$item.rows) !== this.newPosition) {
          this.itemBackup[3] = this.gridsterItem.$item.rows;
          this.gridsterItem.$item.rows = this.newPosition - this.gridsterItem.$item.y;
          this.pushResize.pushItems(this.pushResize.fromNorth);
          this.push.pushItems(this.push.fromNorth, this.gridster.$options.disablePushOnResize);
          if (this.gridster.checkCollision(this.gridsterItem.$item)) {
            this.gridsterItem.$item.rows = this.itemBackup[3];
            this.setItemHeight(this.gridster.positionYToPixels(this.gridsterItem.$item.rows) - this.margin);
            return;
          } else {
            this.gridster.previewStyle();
          }
          this.pushResize.checkPushBack();
          this.push.checkPushBack();
        }
        this.setItemHeight(this.height);
      }
    
      handleE(e) {
        this.width = e.clientX + this.offsetLeft - this.diffRight - this.left;
        if (this.minWidth > this.width) {
          this.width = this.minWidth;
        }
        this.right = this.left + this.width;
        this.newPosition = this.gridster.pixelsToPositionX(this.right, Math.ceil);
        if ((this.gridsterItem.$item.x + this.gridsterItem.$item.cols) !== this.newPosition) {
          this.itemBackup[2] = this.gridsterItem.$item.cols;
          this.gridsterItem.$item.cols = this.newPosition - this.gridsterItem.$item.x;
          this.pushResize.pushItems(this.pushResize.fromWest);
          this.push.pushItems(this.push.fromWest, this.gridster.$options.disablePushOnResize);
          if (this.gridster.checkCollision(this.gridsterItem.$item)) {
            this.gridsterItem.$item.cols = this.itemBackup[2];
            this.setItemWidth(this.gridster.positionXToPixels(this.gridsterItem.$item.cols) - this.margin);
            return;
          } else {
            this.gridster.previewStyle();
          }
          this.pushResize.checkPushBack();
          this.push.checkPushBack();
        }
        this.setItemWidth(this.width);
      }
    
      handleNW(e) {
        this.handleN(e);
        this.handleW(e);
      }
    
      handleNE(e) {
        this.handleN(e);
        this.handleE(e);
      }
    
      handleSW(e) {
        this.handleS(e);
        this.handleW(e);
      }
    
      handleSE(e) {
        this.handleS(e);
        this.handleE(e);
      }
    
      toggle() {
        this.resizeEnabled = this.gridsterItem.canBeResized();
      }
    
      dragStartDelay(e) {
        utils.checkTouchEvent(e);
        if (!this.gridster.$options.resizable.delayStart) {
          this.dragStart(e);
          return;
        }
        const timeout = setTimeout(() => {
          this.dragStart(e);
          cancelDrag();
        }, this.gridster.$options.resizable.delayStart);
        const cancelMouse = this.gridsterItem.renderer.listen('document', 'mouseup', cancelDrag);
        const cancelMouseLeave = this.gridsterItem.renderer.listen('document', 'mouseleave', cancelDrag);
        const cancelOnBlur = this.gridsterItem.renderer.listen('window', 'blur', cancelDrag);
        const cancelTouchMove = this.gridsterItem.renderer.listen('document', 'touchmove', cancelMove);
        const cancelTouchEnd = this.gridsterItem.renderer.listen('document', 'touchend', cancelDrag);
        const cancelTouchCancel = this.gridsterItem.renderer.listen('document', 'touchcancel', cancelDrag);
    
        function cancelMove(eventMove) {
          utils.checkTouchEvent(eventMove);
          if (Math.abs(eventMove.clientX - e.clientX) > 9 || Math.abs(eventMove.clientY - e.clientY) > 9) {
            cancelDrag();
          }
        }
    
        function cancelDrag() {
          clearTimeout(timeout);
          cancelOnBlur();
          cancelMouse();
          cancelMouseLeave();
          cancelTouchMove();
          cancelTouchEnd();
          cancelTouchCancel();
        }
      }
    
      setItemTop(top) {
        this.gridster.gridRenderer.setCellPosition(this.gridsterItem.renderer, this.gridsterItem.el, this.left, top);
      }
    
      setItemLeft(left) {
        this.gridster.gridRenderer.setCellPosition(this.gridsterItem.renderer, this.gridsterItem.el, left, this.top);
      }
    
      setItemHeight(height) {
        this.gridsterItem.renderer.setStyle(this.gridsterItem.el, 'height', height + 'px');
      }
    
      setItemWidth(width) {
        this.gridsterItem.renderer.setStyle(this.gridsterItem.el, 'width', width + 'px');
      }
}