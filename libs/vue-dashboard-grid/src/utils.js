/**
 * @param {object} obj1 
 * @param {object} obj2 
 * @param {object} properties 
 */
export function merge(obj1, obj2, properties) {
    for (const p in obj2) {
      if (obj2[p] !== void 0 && properties.hasOwnProperty(p)) {
        if (typeof obj2[p] === 'object') {
          obj1[p] = merge(obj1[p], obj2[p], properties[p]);
        } else {
          obj1[p] = obj2[p];
        }
      }
    }

    return obj1;
  }
/**
 * @param {Function} func 
 * @param {number} wait 
 * @returns {() => void}
 */
  export function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this, args = arguments;
      const later = function () {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  export function checkTouchEvent(e) {
    if (e.clientX === undefined && e.touches) {
      if (e.touches && e.touches.length) {
        e.clientX = e.touches[0].clientX;
        e.clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length) {
        e.clientX = e.changedTouches[0].clientX;
        e.clientY = e.changedTouches[0].clientY;
      }
    }
  }

  /**
   * @param {import("./grid/grid").GridBase} grid 
   * @param {any} e 
   * @returns {boolean}
   */
  export function checkContentClassForEvent(grid, e) {
    if (grid.$options.draggable.ignoreContent) {
      if (!checkContentClass(e.target, e.currentTarget, grid.$options.draggable.dragHandleClass)) {
        return true;
      }
    } else {
      if (checkContentClass(e.target, e.currentTarget, grid.$options.draggable.ignoreContentClass)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {import("./grid/grid").GridBase} grid 
   * @param {any} e 
   */
  export function checkContentClassForEmptyCellClickEvent(grid, e) {
    return checkContentClass(e.target, e.currentTarget, grid.$options.draggable.ignoreContentClass)
      || checkContentClass(e.target, e.currentTarget, grid.$options.draggable.dragHandleClass);
  }

  /**
   * 
   * @param {HTMLElement} target 
   * @param {HTMLElement} current 
   * @param {string} contentClass 
   * @returns {boolean}
   */
  export function checkContentClass(target, current, contentClass) {
    if (!target || target === current) {
      return false;
    }
    if (target.hasAttribute('class') && target.getAttribute('class').split(' ').indexOf(contentClass) > -1) {
      return true;
    } else {
      return checkContentClass(target.parentNode, current, contentClass);
    }
  }

  /**
   * @param {{ x: number, y: number }} a 
   * @param {{ x: number, y: number }} b 
   * @returns {number}
   */
  export function compareItems(a, b) {
    if (a.y > b.y) {
      return -1;
    } else if (a.y < b.y) {
      return 1;
    } else if (a.x > b.x) {
      return -1;
    } else {
      return 1;
    }
  }

  export function copy(o) {
    return JSON.parse(JSON.stringify(o));
  }