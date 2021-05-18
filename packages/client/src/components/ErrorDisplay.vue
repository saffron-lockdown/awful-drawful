<template>
  <b-alert id="error-display" show fade v-if="error" variant="danger">
    Error: {{ error }}
  </b-alert>
</template>

<script lang="ts">
export default {
  name: 'error-display',
  props: ['error']
}
</script>
