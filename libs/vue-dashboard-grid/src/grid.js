import { DomRenderer } from "./dom-renderer";
import { GridRendererService } from "./renderer.service";

/**
 * @param {HTMLElement} el 
 */
export function createGridInstance(el) {
    /**
     * @type {import("./grid").GridBase}
     */
    const grid = {
        renderer: new DomRenderer(),
        el: el,
        columns: 0,
        rows: 0,
        gridColumns: [],
        gridRows: [],
    };
    const gridRenderer = new GridRendererService(grid);
    grid.gridRenderer = gridRenderer;

    return grid;
}
