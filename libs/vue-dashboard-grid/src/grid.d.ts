import { WidgetBase, WidgetConfig } from './widget';
import { DomRenderer } from './dom-renderer';
import { GridRendererService } from './renderer.service';
import { GridEmptyCellService } from './empty-cell.service';
import { GridCompactService } from './compact.service';

type gridTypes = 'fit' | 'scrollVertical' | 'scrollHorizontal' | 'fixed' | 'verticalFixed' | 'horizontalFixed';
type displayGrids = 'always' | 'onDrag&Resize' | 'none';
type compactTypes =
  'none'
  | 'compactUp'
  | 'compactLeft'
  | 'compactUp&Left'
  | 'compactLeft&Up'
  | 'compactRight'
  | 'compactUp&Right'
  | 'compactRight&Up';

enum GridType {
  Fit = 'fit',
  ScrollVertical = 'scrollVertical',
  ScrollHorizontal = 'scrollHorizontal',
  Fixed = 'fixed',
  VerticalFixed = 'verticalFixed',
  HorizontalFixed = 'horizontalFixed'
}

enum DisplayGrid {
  Always = 'always',
  OnDragAndResize = 'onDrag&Resize',
  None = 'none'
}

enum CompactType {
  None = 'none',
  CompactUp = 'compactUp',
  CompactLeft = 'compactLeft',
  CompactUpAndLeft = 'compactUp&Left',
  CompactLeftAndUp = 'compactLeft&Up',
  CompactRight = 'compactRight',
  CompactUpAndRight = 'compactUp&Right',
  CompactRightAndUp = 'compactRight&Up',
}

interface GridConfig {
  gridType?: gridTypes;
  fixedColWidth?: number;
  fixedRowHeight?: number;
  keepFixedHeightInMobile?: boolean;
  keepFixedWidthInMobile?: boolean;
  setGridSize?: boolean;
  compactType?: compactTypes;
  mobileBreakpoint?: number;
  minCols?: number;
  maxCols?: number;
  minRows?: number;
  maxRows?: number;
  defaultItemCols?: number;
  defaultItemRows?: number;
  maxItemCols?: number;
  maxItemRows?: number;
  minItemCols?: number;
  minItemRows?: number;
  minItemArea?: number;
  maxItemArea?: number;
  margin?: number;
  outerMargin?: boolean;
  outerMarginTop?: number | null;
  outerMarginRight?: number | null;
  outerMarginBottom?: number | null;
  outerMarginLeft?: number | null;
  useTransformPositioning?: boolean;
  scrollSensitivity?: number | null;
  scrollSpeed?: number;
  initCallback?: (grid: GridBase) => void;
  destroyCallback?: (grid: GridBase) => void;
  gridSizeChangedCallback?: (grid: GridBase) => void;
  itemChangeCallback?: (widgetConfig: WidgetConfig, widget: WidgetBase) => void;
  itemResizeCallback?: (widgetConfig: WidgetConfig, widget: WidgetBase) => void;
  itemInitCallback?: (widgetConfig: WidgetConfig, widget: WidgetBase) => void;
  itemRemovedCallback?: (widgetConfig: WidgetConfig, widget: WidgetBase) => void;
  itemValidateCallback?: (widgetConfig: WidgetConfig) => boolean;
  draggable?: Draggable;
  resizable?: Resizable;
  swap?: boolean;
  swapWhileDragging?: boolean;
  pushItems?: boolean;
  disablePushOnDrag?: boolean;
  disablePushOnResize?: boolean;
  disableAutoPositionOnConflict?: boolean;
  pushDirections?: PushDirections;
  pushResizeItems?: boolean;
  displayGrid?: displayGrids;
  disableWindowResize?: boolean;
  disableWarnings?: boolean;
  scrollToNewItems?: boolean;
  disableScrollHorizontal?: boolean;
  disableScrollVertical?: boolean;
  enableEmptyCellClick?: boolean;
  enableEmptyCellContextMenu?: boolean;
  enableEmptyCellDrop?: boolean;
  enableEmptyCellDrag?: boolean;
  enableOccupiedCellDrop?: boolean;
  emptyCellClickCallback?: (event: MouseEvent, widgetConfig: WidgetConfig) => void;
  emptyCellContextMenuCallback?: (event: MouseEvent, widgetConfig: WidgetConfig) => void;
  emptyCellDropCallback?: (event: MouseEvent, widgetConfig: WidgetConfig) => void;
  emptyCellDragCallback?: (event: MouseEvent, widgetConfig: WidgetConfig) => void;
  emptyCellDragMaxCols?: number;
  emptyCellDragMaxRows?: number;
  ignoreMarginInRow?: boolean;
  api?: {
    resize?: () => void,
    optionsChanged?: () => void,
    getNextPossiblePosition?: (newwidgetConfig: WidgetConfig) => boolean,
    getFirstPossiblePosition?: (widgetConfig: WidgetConfig) => WidgetConfig,
    getLastPossiblePosition?: (widgetConfig: WidgetConfig) => WidgetConfig,
  };

  [propName: string]: any;
}

interface DragBase {
  enabled?: boolean;
  stop?: (widgetConfig: WidgetConfig, widget: WidgetBase, event: MouseEvent) => Promise<any> | void;
  start?: (widgetConfig: WidgetConfig, widget: WidgetBase, event: MouseEvent) => void;
  delayStart?: number;
}

interface Draggable extends DragBase {
  ignoreContentClass?: string;
  ignoreContent?: boolean;
  dragHandleClass?: string;
  dropOverItems?: boolean;
  dropOverItemsCallback?: (source: WidgetConfig, target: WidgetConfig, grid?: Grid) => void;
}

interface Resizable extends DragBase {
  handles?: {
    s: boolean,
    e: boolean,
    n: boolean,
    w: boolean,
    se: boolean,
    ne: boolean,
    sw: boolean,
    nw: boolean
  };
}

interface PushDirections {
  north: boolean;
  east: boolean;
  south: boolean;
  west: boolean;
}

interface GridBase {
    $options: GridConfig;
    grid: Array<WidgetBase>;
    checkCollision: (item: WidgetConfig) => WidgetBase | boolean;
    checkCollisionForSwaping: (item: WidgetConfig) => WidgetBase | boolean;
    positionXToPixels: (x: number) => number;
    pixelsToPositionX: (x: number, roundingMethod: (x: number) => number, noLimit?: boolean) => number;
    positionYToPixels: (y: number) => number;
    pixelsToPositionY: (y: number, roundingMethod: (x: number) => number, noLimit?: boolean) => number;
    findItemWithItem: (item: WidgetConfig) => WidgetBase | boolean;
    findItemsWithItem: (item: WidgetConfig) => Array<WidgetBase>;
    checkGridCollision: (item: WidgetConfig) => boolean;
    el: any;
    renderer: DomRenderer;
    gridRenderer: GridRendererService;
    options: GridConfig;
    calculateLayoutDebounce: () => void;
    updateGrid: () => void;
    movingItem: WidgetConfig | null;
    addItem: (item: WidgetBase) => void;
    removeItem: (item: WidgetBase) => void;
    previewStyle: (drag?: boolean) => void;
    mobile: boolean;
    curWidth: number;
    curHeight: number;
    columns: number;
    rows: number;
    curColWidth: number;
    curRowHeight: number;
    windowResize: (() => void) | null;
    setGridDimensions: (() => void);
    dragInProgress: boolean;
    emptyCell: GridEmptyCellService;
    compact: GridCompactService;
    gridRows: Array<number>;
    gridColumns: Array<number>;
  }

interface GridResizeEventType {
    n: boolean;
    s: boolean;
    w: boolean;
    e: boolean;
}