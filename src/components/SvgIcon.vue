<!-- components/SvgIcon.vue -->
<template>
  <span class="svg-icon" v-html="coloredSvg"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  svg: string
  color: string
}>()

// 替换所有 fill 属性为 currentColor，然后由父组件控制颜色
const coloredSvg = computed(() => {
  return props.svg.replace(/fill=".*?"/g, 'fill="currentColor"')
})
</script>

<style scoped>
.svg-icon svg {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}
</style>
