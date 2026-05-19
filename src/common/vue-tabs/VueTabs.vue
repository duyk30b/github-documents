<template>
  <div class="vue-tabs">
    <div class="tab-menu">
      <slot name="menu"></slot>
    </div>
    <div class="tab-panel">
      <slot name="panel" :tabSelect="tabSelect"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    tabShow?: string | number
  }>(),
  {
    tabShow: 0,
  }
)
const emit = defineEmits<{ (e: 'update:tabShow', value: string | number): void }>()
const tabSelect = ref<string | number>(props.tabShow)
watch(
  () => props.tabShow,
  (newVal) => {
    tabSelect.value = newVal
  },
  { immediate: true }
)

const listenTabMenuChange = (value: string | number) => {
  tabSelect.value = value
  emit('update:tabShow', value)
}

provide('eventTabMenuChange', listenTabMenuChange)
provide('tabSelect', tabSelect)
</script>

<style lang="scss">
.vue-tabs {
  .tab-menu {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 0 4px;
    border-bottom: 1px solid #cdcdcd;
  }
  .tab-panel {
    background-color: #fff;
  }
}
</style>
