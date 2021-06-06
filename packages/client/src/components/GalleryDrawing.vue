<template>
  <div :key="id" class="d-flex flex-grow-1 mb-2">
    <canvas :id="id" class="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'gallery-drawing',
  props: {
    id: String,
  },
});
</script>

<style scoped>
.canvas {
  border: 2px solid grey;
}
</style>
