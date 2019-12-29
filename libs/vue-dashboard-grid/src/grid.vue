<template>
    <div class="dgrid">
        
        <!-- <div class="dgrid-column" *ngFor="let column of gridColumns; let i = index;"
            :style="gridRenderer.getGridColumnStyle(i)"></div>
        <div class="dgrid-row" *ngFor="let row of gridRows; let i = index;"
            :style="gridRenderer.getGridRowStyle(i)"></div> -->
<slot></slot>
        <dgrid-preview class="dgrid-preview"></dgrid-preview>
    </div>
</template>

<script>
import Preview from './preview.vue';
import { createGridInstance } from './grid.js';

export default {
    components: {
        'dgrid-preview': Preview
    },
    mounted() {
        this.gridModel = createGridInstance(this.$el);
    }
}
</script>

<style>
.dgrid {
  position: relative;
  box-sizing: border-box;
  background: grey;
  width: 100%;
  height: 100%;
  user-select: none;
  display: block;
}

.dgrid.fit {
  overflow-x: hidden;
  overflow-y: hidden;
}

.dgrid.scrollVertical {
  overflow-x: hidden;
  overflow-y: auto;
}

.dgrid.scrollHorizontal {
  overflow-x: auto;
  overflow-y: hidden;
}

.dgrid.fixed {
  overflow: auto;
}

.dgrid.mobile {
  overflow-x: hidden;
  overflow-y: auto;
}

.dgrid.mobile .dgrid-item {
  position: relative;
}

.dgrid .dgrid-column, .dgrid .dgrid-row {
  position: absolute;
  display: none;
  transition: .3s;
  box-sizing: border-box;
}

.dgrid.display-grid .dgrid-column, .dgrid.display-grid .dgrid-row {
  display: block;
}

.dgrid .dgrid-column {
  border-left: 1px solid white;
  border-right: 1px solid white;
}

.dgrid .dgrid-row {
  border-top: 1px solid white;
  border-bottom: 1px solid white;
}
</style>