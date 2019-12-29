<template>
    <div class="dgrid">
        <div class="dgrid-column"
            v-for="(column, cIdx) in gridColumns" :key="'c' + cIdx"
            :style="getGridColumnStyle(cIdx)"></div>
        <div class="dgrid-row" v-for="(row, rIdx) in gridRows" :key="'r' + rIdx"
            :style="getGridRowStyle(rIdx)"></div>
        <slot></slot>
        <dgrid-preview class="dgrid-preview"></dgrid-preview>
    </div>
</template>

<script>
import Preview from './preview.vue';
import { createGridInstance } from './grid-logic';

function createProvider() {
  const cbs = [];
  return {
    value: null,
    emit(data) {
      this.value = data;
      cbs.forEach(cb => cb && cb(data));
    },
    subscribe(cb) {
      cbs.push(cb);
    }
  }
}

export default {
    components: {
        'dgrid-preview': Preview
    },
    props: {
      config: Object
    },
    data() {
      return {
        gridModel: null
      }
    },
    provide() {
      this.provider = createProvider();
      return {
        provider: this.provider
      }
    },
    watch: {
      config: function (newVal, oldVal) {
        this.gridModel.onOptionChanged(newVal);
      }
    },
    computed: {
        gridColumns: function() {
          const cols = this.gridModel && this.gridModel.gridColumns;
          return cols;
        },
        gridRows: function() {
          const rows = this.gridModel && this.gridModel.gridRows;
          return rows;
        }
    },
    methods: {
      getGridColumnStyle(i) {
        return this.gridModel.gridRenderer.getGridColumnStyle(i);
      },
      getGridRowStyle(i) {
        return this.gridModel.gridRenderer.getGridRowStyle(i);
      }
    },
    mounted() {
        const gridModel = createGridInstance(this.$el);
        gridModel.onOptionChanged(this.config);
        gridModel.onInit();
        this.provider.emit(gridModel);
        this.gridModel = gridModel;
    },
    beforeDestroy() {
        this.gridModel.onDestroy();
        this.gridModel = undefined;
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