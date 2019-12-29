export class DomRenderer {
    /**
     * 
     * @param {HTMLElement} el 
     * @param {string} prop
     * @param {string | number} value 
     */
    setStyle(el, prop, value) {
        if (!el) return;

        el.style[prop] = value;
    }

    /**
     * 
     * @param {HTMLElement} el 
     * @param {string} addClass 
     */
    addClass(el, addClass) {
        el.classList.add(addClass)
    }

     /**
     * 
     * @param {HTMLElement} el 
     * @param {string} removeClass 
     */
    removeClass(el, removeClass) {
        el.classList.remove(removeClass);
    }

    /**
     * 
     * @param {HTMLElement | string} tar 
     * @param {string} event 
     * @param {(...args) => void} cb 
     */
    listen(tar, event, cb, options) {
        /**@type {HTMLElement} */
        let target = tar;
        switch (tar) {
            case 'window':
                target = window;
                break;
            case 'document':
                target = document;
                break;
            case 'body':
                target = document.body;
                break;
            default:
                break;
        }

        function handler(...args) {
            cb && cb(...args);
        }

        target.addEventListener(event, handler, options);

        return () => {
            target.removeEventListener(event, handler);
        }
    }
}