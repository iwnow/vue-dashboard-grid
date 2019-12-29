
const { Grid, Widget } = window['@iwnow/vue-dashboard-grid'];

Vue.component('grid', Grid);
Vue.component('widget', Widget);

let gridConfig = {
	gridType: 'fit',
	margin: 10,
	outerMargin: true,
	outerMarginTop: null,
	outerMarginRight: null,
	outerMarginBottom: null,
	outerMarginLeft: null,
	useTransformPositioning: true,
	mobileBreakpoint: 640,
	minCols: 2,
	maxCols: 12,
	minRows: 1,
	maxRows: 100,
	maxItemCols: 100,
	minItemCols: 1,
	maxItemRows: 100,
	minItemRows: 1,
	maxItemArea: 2500,
	minItemArea: 1,
	defaultItemCols: 1,
	defaultItemRows: 1,
	fixedColWidth: 105,
	fixedRowHeight: 105,
	keepFixedHeightInMobile: false,
	keepFixedWidthInMobile: false,
	scrollSensitivity: 10,
	scrollSpeed: 20,
	enableEmptyCellClick: false,
	enableEmptyCellContextMenu: false,
	enableEmptyCellDrop: false,
	enableEmptyCellDrag: false,
	enableOccupiedCellDrop: false,
	emptyCellDragMaxCols: 50,
	emptyCellDragMaxRows: 50,
	ignoreMarginInRow: false,
	draggable: {
	  enabled: true,
	},
	resizable: {
	  enabled: true,
	},
	swap: false,
	pushItems: true,
	disablePushOnDrag: false,
	disablePushOnResize: false,
	pushDirections: {north: true, east: true, south: true, west: true},
	pushResizeItems: false,
	displayGrid: 'always',
	disableWindowResize: false,
	disableWarnings: false,
	scrollToNewItems: false
  };

  let items = [
	{cols: 2, rows: 1, y: 0, x: 0},
	{cols: 2, rows: 2, y: 0, x: 2, hasContent: true},
	{cols: 1, rows: 1, y: 0, x: 4},
	{cols: 1, rows: 1, y: 2, x: 5},
	{cols: 1, rows: 1, y: 1, x: 0},
	{cols: 1, rows: 1, y: 1, x: 0},
	{cols: 2, rows: 2, y: 3, x: 5, minItemRows: 2, minItemCols: 2, label: 'Min rows & cols = 2'},
	{cols: 2, rows: 2, y: 2, x: 0, maxItemRows: 2, maxItemCols: 2, label: 'Max rows & cols = 2'},
	{cols: 2, rows: 1, y: 2, x: 2, dragEnabled: true, resizeEnabled: true, label: 'Drag&Resize Enabled'},
	{cols: 1, rows: 1, y: 2, x: 4, dragEnabled: false, resizeEnabled: false, label: 'Drag&Resize Disabled'},
	{cols: 1, rows: 1, y: 2, x: 6}
  ];

  const app = new Vue({
	el: '#app',
	data() {
		return {
			items,
			gridConfig
		}
	}
});