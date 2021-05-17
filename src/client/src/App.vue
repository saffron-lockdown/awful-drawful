<template>
  <HelloWorld />
</template>

<script lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import ErrorDisplay from './components/ErrorDisplay.vue'

export default {
  name: 'App',
  components: {
    HelloWorld,
    ErrorDisplay,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
