<template>
  <div :class="['flex', { center: layout === 'c', horizon: layout === 'h' }]"><slot>123</slot></div>
</template>

<script setup lang="ts">
const { layout = 'c' } = defineProps<{ layout?: 'h' | 'v' | 'c' }>()
</script>

<style scoped>
.flex {
  display: flex;
  position: relative;
}
.center {
  align-items: center;
  justify-content: center;
}
.horizon {
  align-items: center;
}
</style>
