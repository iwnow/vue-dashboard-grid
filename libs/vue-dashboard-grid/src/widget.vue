<template>
  <div class="dgrid-item">
	  <slot></slot>
    <div @mousedown="dragStartDelay" @touchstart="dragStartDelay"
        v-if="rhS"
        class="dgrid-item-resizable-handler handle-s"></div>
    <div @mousedown="dragStartDelay" @touchstart="dragStartDelay"
        v-if="rhE"
        class="dgrid-item-resizable-handler handle-e"></div>
    <div @mousedown="dragStartDelay" @touchstart="dragStartDelay"
        v-if="rhN"
        class="dgrid-item-resizable-handler handle-n"></div>
    <div @mousedown="dragStartDelay" @touchstart="dragStartDelay"
        v-if="rhW"
        class="dgrid-item-resizable-handler handle-w"></div>
    <div @mousedown="dragStartDelay" @touchstart="dragStartDelay"
        v-if="rhSe"
        class="dgrid-item-resizable-handler handle-se"></div>
    <div @mousedown="dragStartDelay" @touchstart="dragStartDelay"
        v-if="rhNe"
        class="dgrid-item-resizable-handler handle-ne"></div>
    <div @mousedown="dragStartDelay" @touchstart="dragStartDelay"
        v-if="rhSw"
        class="dgrid-item-resizable-handler handle-sw"></div>
    <div @mousedown="dragStartDelay" @touchstart="dragStartDelay"
        v-if="rhNw"
        class="dgrid-item-resizable-handler handle-nw"></div>
  </div>
</template>

<script>
import { createWidgetInstance } from './widget-logic';

export default {
    inject: ['provider'],
    props: {
      config: Object
    },
    data() {
      return {
        widgetModel: null
      }
    },
    watch: {
      config: function (newVal, oldVal) {
        this.widgetModel.item = newVal;
        this.widgetModel.updateOptions();
      }
    },
    computed: {
        grid() {
          return this.widgetModel && this.widgetModel.gridster;
        },
        rh() {
          return this.grid && this.grid.$options.resizable.handles;
        },
        resizeEnabled() {
          return this.widgetModel && this.widgetModel.resize.resizeEnabled;
        },
        rhS() {
          return this.resizeEnabled && this.rh && this.rh.s;
        },
        rhE() {
          return this.resizeEnabled && this.rh && this.rh.e;
        },
        rhN() {
          return this.resizeEnabled && this.rh && this.rh.n;
        },
        rhW() {
          return this.resizeEnabled && this.rh && this.rh.w;
        },
        rhSe() {
          return this.resizeEnabled && this.rh && this.rh.se;
        },
        rhNe() {
          return this.resizeEnabled && this.rh && this.rh.ne;
        },
        rhSw() {
          return this.resizeEnabled && this.rh && this.rh.sw;
        },
        rhNw() {
          return this.resizeEnabled && this.rh && this.rh.nw;
        }
    },
    methods: {
      dragStartDelay(e) {
        return this.widgetModel.resize.dragStartDelay(e);
      }
    },
    mounted() {
        this.provider.subscribe(grid => {
          const widgetModel = createWidgetInstance(this.$el, grid, this.config);
          widgetModel.onInit();
          this.widgetModel = widgetModel;
        });
    },
    beforeDestroy() {
        this.widgetModel.onDestroy();
    }
}
</script>

<style>
.dgrid-item {
  box-sizing: border-box;
  z-index: 1;
  position: absolute;
  overflow: hidden;
  transition: .3s;
  display: none;
  background: white;
  user-select: text;
}

.dgrid-item.dgrid-item-moving {
  cursor: move;
}

.dgrid-item.dgrid-item-resizing, .dgrid-item.dgrid-item-moving {
  transition: 0s;
  z-index: 2;
  box-shadow: 0 0 5px 5px rgba(0, 0, 0, .2), 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12);
}

.dgrid-item-resizable-handler {
  position: absolute;
  z-index: 2;
}

.dgrid-item-resizable-handler.handle-n {
  cursor: n-resize;
  height: 10px;
  right: 0;
  top: 0;
  left: 0;
}

.dgrid-item-resizable-handler.handle-e {
  cursor: e-resize;
  width: 10px;
  bottom: 0;
  right: 0;
  top: 0;
}

.dgrid-item-resizable-handler.handle-s {
  cursor: s-resize;
  height: 10px;
  right: 0;
  bottom: 0;
  left: 0;
}

.dgrid-item-resizable-handler.handle-w {
  cursor: w-resize;
  width: 10px;
  left: 0;
  top: 0;
  bottom: 0;
}

.dgrid-item-resizable-handler.handle-ne {
  cursor: ne-resize;
  width: 10px;
  height: 10px;
  right: 0;
  top: 0;
}

.dgrid-item-resizable-handler.handle-nw {
  cursor: nw-resize;
  width: 10px;
  height: 10px;
  left: 0;
  top: 0;
}

.dgrid-item-resizable-handler.handle-se {
  cursor: se-resize;
  width: 0;
  height: 0;
  right: 0;
  bottom: 0;
  border-style: solid;
  border-width: 0 0 10px 10px;
  border-color: transparent;
}

.dgrid-item-resizable-handler.handle-sw {
  cursor: sw-resize;
  width: 10px;
  height: 10px;
  left: 0;
  bottom: 0;
}

.dgrid-item:hover .dgrid-item-resizable-handler.handle-se {
  border-color: transparent transparent #ccc
}
</style>