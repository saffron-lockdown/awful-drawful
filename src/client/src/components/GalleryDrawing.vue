<template>
  <div :key="id" class="d-flex flex-grow-1 mb-2">
    <canvas :id="id"></canvas>
  </div>
</template>

<script lang="ts">
export default {
  name: 'gallery-drawing',
  props: {
    id: String
  }
}
</script>
