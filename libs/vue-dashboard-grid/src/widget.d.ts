import { GridBase } from './grid';
import { DomRenderer } from './dom-renderer';
import { GridResizeService } from './grid/resize.service';
import { GridDragService } from './grid/drag.service';

interface WidgetConfig {
    x: number;
    y: number;
    rows: number;
    cols: number;
    initCallback?: (widget: WidgetConfig, widgetComponent: WidgetBase) => void;
    dragEnabled?: boolean;
    resizeEnabled?: boolean;
    compactEnabled?: boolean;
    maxItemRows?: number;
    minItemRows?: number;
    maxItemCols?: number;
    minItemCols?: number;
    minItemArea?: number;
    maxItemArea?: number;
  
    [propName: string]: any;
  }

interface WidgetBase {
    item: WidgetConfig;
    $item: WidgetConfig;
    top: number;
    left: number;
    width: number;
    height: number;
    drag: GridDragService;
    resize: GridResizeService;
    notPlaced: boolean;
    updateOptions: () => void;
    itemChanged: () => void;
    setSize: () => void;
    checkItemChanges: (newValue: WidgetConfig, oldValue: WidgetConfig) => void;
    canBeDragged: () => boolean;
    canBeResized: () => boolean;
    el: any;
    gridster: GridBase;
    renderer: DomRenderer;
  }