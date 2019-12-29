<template>
  
</template>

<script>
import { DomRenderer } from './dom-renderer';
export default {
  inject: ['provider'],
  methods: {
    previewStyle(drag) {
      if (!this.grid.movingItem) {
        this.renderer.setStyle(this.el, 'display', '');
      } else {
        if (this.grid.compact && drag) {
          this.grid.compact.checkCompactItem(this.grid.movingItem);
        }
        this.renderer.setStyle(this.el, 'display', 'block');
        this.grid.gridRenderer.updateItem(this.el, this.grid.movingItem, this.renderer);
      }
    }
  },
  created() {
    this.renderer = new DomRenderer();
    this.provider.subscribe(grid => {
      this.grid = grid;
      this.grid.previewStyle = this.previewStyle.bind(this);
    });
  },
  mounted() {
    this.el = this.$el;
  }
}
</script>

<style>
.dgrid-preview {
  position: absolute;
  display: none;
  background: rgba(0, 0, 0, 0.15);
}
</style>