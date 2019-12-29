export class GridPushResizeService {
    constructor(gridsterItem) {
        this.pushedItems = [];
        this.pushedItemsPath = [];
        this.gridsterItem = gridsterItem;
        this.gridster = gridsterItem.gridster;
        this.tryPattern = {
          fromEast: this.tryWest,
          fromWest: this.tryEast,
          fromNorth: this.trySouth,
          fromSouth: this.tryNorth
        };
        this.fromSouth = 'fromSouth';
        this.fromNorth = 'fromNorth';
        this.fromEast = 'fromEast';
        this.fromWest = 'fromWest';
      }
    
      destroy() {
        delete this.gridster;
        delete this.gridsterItem;
      }
    
      pushItems(direction) {
        if (this.gridster.$options.pushResizeItems) {
          return this.push(this.gridsterItem, direction);
        } else {
          return false;
        }
      }
    
      restoreItems() {
        let i = 0;
        const l = this.pushedItems.length;
        let pushedItem;
        for (; i < l; i++) {
          pushedItem = this.pushedItems[i];
          pushedItem.$item.x = pushedItem.item.x || 0;
          pushedItem.$item.y = pushedItem.item.y || 0;
          pushedItem.$item.cols = pushedItem.item.cols || 1;
          pushedItem.$item.row = pushedItem.item.row || 1;
          pushedItem.setSize();
        }
        this.pushedItems = [];
        this.pushedItemsPath = [];
      }
    
      setPushedItems() {
        let i = 0;
        const l = this.pushedItems.length;
        let pushedItem;
        for (; i < l; i++) {
          pushedItem = this.pushedItems[i];
          pushedItem.checkItemChanges(pushedItem.$item, pushedItem.item);
        }
        this.pushedItems = [];
        this.pushedItemsPath = [];
      }
    
      checkPushBack() {
        let i = this.pushedItems.length - 1;
        let change = false;
        for (; i > -1; i--) {
          if (this.checkPushedItem(this.pushedItems[i], i)) {
            change = true;
          }
        }
        if (change) {
          this.checkPushBack();
        }
      }
    
      push(gridsterItem, direction) {
        const gridsterItemCollision = this.gridster.checkCollision(gridsterItem.$item);
        if (gridsterItemCollision && gridsterItemCollision !== true &&
          gridsterItemCollision !== this.gridsterItem && gridsterItemCollision.canBeResized()) {
          if (this.tryPattern[direction].call(this, gridsterItemCollision, gridsterItem, direction)) {
            return true;
          }
        } else if (gridsterItemCollision === false) {
          return true;
        }
        return false;
      }
    
      trySouth(gridsterItemCollide, gridsterItem,
                       direction) {
        const backUpY = gridsterItemCollide.$item.y;
        const backUpRows = gridsterItemCollide.$item.rows;
        gridsterItemCollide.$item.y = gridsterItem.$item.y + gridsterItem.$item.rows;
        gridsterItemCollide.$item.rows = backUpRows + backUpY - gridsterItemCollide.$item.y;
        if (!GridsterComponent.checkCollisionTwoItems(gridsterItemCollide.$item, gridsterItem.$item)
          && !this.gridster.checkGridCollision(gridsterItemCollide.$item)) {
          gridsterItemCollide.setSize();
          this.addToPushed(gridsterItemCollide);
          this.push(gridsterItem, direction);
          return true;
        } else {
          gridsterItemCollide.$item.y = backUpY;
          gridsterItemCollide.$item.rows = backUpRows;
        }
        return false;
      }
    
      tryNorth(gridsterItemCollide, gridsterItem,
                       direction) {
        const backUpRows = gridsterItemCollide.$item.rows;
        gridsterItemCollide.$item.rows = gridsterItem.$item.y - gridsterItemCollide.$item.y;
        if (!GridsterComponent.checkCollisionTwoItems(gridsterItemCollide.$item, gridsterItem.$item)
          && !this.gridster.checkGridCollision(gridsterItemCollide.$item)) {
          gridsterItemCollide.setSize();
          this.addToPushed(gridsterItemCollide);
          this.push(gridsterItem, direction);
          return true;
        } else {
          gridsterItemCollide.$item.rows = backUpRows;
        }
        return false;
      }
    
      tryEast(gridsterItemCollide, gridsterItem,
                      direction) {
        const backUpX = gridsterItemCollide.$item.x;
        const backUpCols = gridsterItemCollide.$item.cols;
        gridsterItemCollide.$item.x = gridsterItem.$item.x + gridsterItem.$item.cols;
        gridsterItemCollide.$item.cols = backUpCols + backUpX - gridsterItemCollide.$item.x;
        if (!GridsterComponent.checkCollisionTwoItems(gridsterItemCollide.$item, gridsterItem.$item)
          && !this.gridster.checkGridCollision(gridsterItemCollide.$item)) {
          gridsterItemCollide.setSize();
          this.addToPushed(gridsterItemCollide);
          this.push(gridsterItem, direction);
          return true;
        } else {
          gridsterItemCollide.$item.x = backUpX;
          gridsterItemCollide.$item.cols = backUpCols;
        }
        return false;
      }
    
      tryWest(gridsterItemCollide, gridsterItem,
                      direction) {
        const backUpCols = gridsterItemCollide.$item.cols;
        gridsterItemCollide.$item.cols = gridsterItem.$item.x - gridsterItemCollide.$item.x;
        if (!GridsterComponent.checkCollisionTwoItems(gridsterItemCollide.$item, gridsterItem.$item)
          && !this.gridster.checkGridCollision(gridsterItemCollide.$item)) {
          gridsterItemCollide.setSize();
          this.addToPushed(gridsterItemCollide);
          this.push(gridsterItem, direction);
          return true;
        } else {
          gridsterItemCollide.$item.cols = backUpCols;
        }
        return false;
      }
    
      addToPushed(gridsterItem) {
        if (this.pushedItems.indexOf(gridsterItem) < 0) {
          this.pushedItems.push(gridsterItem);
          this.pushedItemsPath.push([
            {
              x: gridsterItem.item.x || 0,
              y: gridsterItem.item.y || 0,
              cols: gridsterItem.item.cols || 0,
              rows: gridsterItem.item.rows || 0
            },
            {
              x: gridsterItem.$item.x,
              y: gridsterItem.$item.y,
              cols: gridsterItem.$item.cols,
              rows: gridsterItem.$item.rows
            }]);
        } else {
          const i = this.pushedItems.indexOf(gridsterItem);
          this.pushedItemsPath[i].push(
            {
              x: gridsterItem.$item.x,
              y: gridsterItem.$item.y,
              cols: gridsterItem.$item.cols,
              rows: gridsterItem.$item.rows
            });
        }
      }
    
      removeFromPushed(i) {
        if (i > -1) {
          this.pushedItems.splice(i, 1);
          this.pushedItemsPath.splice(i, 1);
        }
      }
    
      checkPushedItem(pushedItem, i) {
        const path = this.pushedItemsPath[i];
        let j = path.length - 2;
        let lastPosition, x, y, cols, rows;
        for (; j > -1; j--) {
          lastPosition = path[j];
          x = pushedItem.$item.x;
          y = pushedItem.$item.y;
          cols = pushedItem.$item.cols;
          rows = pushedItem.$item.rows;
          pushedItem.$item.x = lastPosition.x;
          pushedItem.$item.y = lastPosition.y;
          pushedItem.$item.cols = lastPosition.cols;
          pushedItem.$item.rows = lastPosition.rows;
          if (!this.gridster.findItemWithItem(pushedItem.$item)) {
            pushedItem.setSize();
            path.splice(j + 1, path.length - 1 - j);
          } else {
            pushedItem.$item.x = x;
            pushedItem.$item.y = y;
            pushedItem.$item.cols = cols;
            pushedItem.$item.rows = rows;
          }
        }
        if (path.length < 2) {
          this.removeFromPushed(i);
          return true;
        }
        return false;
      }
}