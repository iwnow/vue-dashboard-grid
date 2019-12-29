import { CompactType } from './const';

export class GridCompactService {
    constructor(gridster) {
        this.gridster = gridster;
    }
  
    destroy() {
      delete this.gridster;
    }
  
    checkCompact() {
      if (this.gridster.$options.compactType !== CompactType.None) {
        if (this.gridster.$options.compactType === CompactType.CompactUp) {
          this.checkCompactUp();
        } else if (this.gridster.$options.compactType === CompactType.CompactLeft) {
          this.checkCompactLeft();
        } else if (this.gridster.$options.compactType === CompactType.CompactUpAndLeft) {
          this.checkCompactUp();
          this.checkCompactLeft();
        } else if (this.gridster.$options.compactType === CompactType.CompactLeftAndUp) {
          this.checkCompactLeft();
          this.checkCompactUp();
        } else if (this.gridster.$options.compactType === CompactType.CompactRight) {
          this.checkCompactRight();
        } else if (this.gridster.$options.compactType === CompactType.CompactUpAndRight) {
          this.checkCompactUp();
          this.checkCompactRight();
        } else if (this.gridster.$options.compactType === CompactType.CompactRightAndUp) {
          this.checkCompactRight();
          this.checkCompactUp();
        }
      }
    }
  
    checkCompactItem(item) {
      if (this.gridster.$options.compactType !== CompactType.None) {
        if (this.gridster.$options.compactType === CompactType.CompactUp) {
          this.moveUpTillCollision(item);
        } else if (this.gridster.$options.compactType === CompactType.CompactLeft) {
          this.moveLeftTillCollision(item);
        } else if (this.gridster.$options.compactType === CompactType.CompactUpAndLeft) {
          this.moveUpTillCollision(item);
          this.moveLeftTillCollision(item);
        } else if (this.gridster.$options.compactType === CompactType.CompactLeftAndUp) {
          this.moveLeftTillCollision(item);
          this.moveUpTillCollision(item);
        } else if (this.gridster.$options.compactType === CompactType.CompactUpAndRight) {
          this.moveUpTillCollision(item);
          this.moveRightTillCollision(item);
        }
      }
    }
  
    checkCompactUp() {
      let widgetMovedUp = false, widget, moved;
      const l = this.gridster.grid.length;
      for (let i = 0; i < l; i++) {
        widget = this.gridster.grid[i];
        if (widget.$item.compactEnabled === false) {
          continue;
        }
        moved = this.moveUpTillCollision(widget.$item);
        if (moved) {
          widgetMovedUp = true;
          widget.item.y = widget.$item.y;
          widget.itemChanged();
        }
      }
      if (widgetMovedUp) {
        this.checkCompact();
      }
    }
  
    moveUpTillCollision(item) {
      item.y -= 1;
      if (this.gridster.checkCollision(item)) {
        item.y += 1;
        return false;
      } else {
        this.moveUpTillCollision(item);
        return true;
      }
    }
  
    checkCompactLeft() {
      let widgetMovedUp = false, widget, moved;
      const l = this.gridster.grid.length;
      for (let i = 0; i < l; i++) {
        widget = this.gridster.grid[i];
        if (widget.$item.compactEnabled === false) {
          continue;
        }
        moved = this.moveLeftTillCollision(widget.$item);
        if (moved) {
          widgetMovedUp = true;
          widget.item.x = widget.$item.x;
          widget.itemChanged();
        }
      }
      if (widgetMovedUp) {
        this.checkCompact();
      }
    }
  
    checkCompactRight() {
      let widgetMovedUp = false, widget, moved;
      const l = this.gridster.grid.length;
      for (let i = 0; i < l; i++) {
        widget = this.gridster.grid[i];
        if (widget.$item.compactEnabled === false) {
          continue;
        }
        moved = this.moveRightTillCollision(widget.$item);
        if (moved) {
          widgetMovedUp = true;
          widget.item.x = widget.$item.x;
          widget.itemChanged();
        }
      }
      if (widgetMovedUp) {
        this.checkCompact();
      }
    }
  
    moveLeftTillCollision(item) {
      item.x -= 1;
      if (this.gridster.checkCollision(item)) {
        item.x += 1;
        return false;
      } else {
        this.moveLeftTillCollision(item);
        return true;
      }
    }
  
    moveRightTillCollision(item) {
      item.x += 1;
      if (this.gridster.checkCollision(item)) {
        item.x -= 1;
        return false;
      } else {
        this.moveRightTillCollision(item);
        return true;
      }
    }
}