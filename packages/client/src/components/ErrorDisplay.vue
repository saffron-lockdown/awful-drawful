<template>
  <b-alert id="error-display" show fade v-if="error" variant="danger">
    Error: {{ error }}
  </b-alert>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'error-display',
  props: ['error'],
});
</script>
