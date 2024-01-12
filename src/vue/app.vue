<template>
  <Flex :layout="layout" class="abc"
    ><h4>456</h4>
    <h4>789</h4>
  </Flex>
  <button @click="() => (layout = 'c')">c</button>
  <button @click="() => (layout = 'h')">h</button>
  <button @click="() => (layout = 'v')">v</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Flex from './utility/flex.vue'

const layout = ref(<'c' | 'h' | 'v'>'c')
</script>

<style scoped>
.abc {
  width: 300px;
  height: 300px;
  border: 1px solid red;
}
</style>
