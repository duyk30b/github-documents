<template>
  <Popover
    show-on-hover
    :custom-style="{
      arrow: true,
      offset: 10,
      dropdownArrow: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
      dropdownContent: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        maxHeight: maxHeight,
        maxWidth: maxWidth,
      },
    }"
    :position="{ horizontal: 'center', vertical: 'top' }"
    :delayHide="0"
  >
    <template #trigger>
      <slot name="trigger"></slot>
    </template>
    <template #content>
      <div class="tooltip-content">
        <slot></slot>
      </div>
    </template>
  </Popover>
</template>

<script lang="ts" setup>
import Popover from './Popover.vue'

const props = withDefaults(
  defineProps<{
    maxHeight?: number | string
    maxWidth?: number | string
  }>(),
  {},
)
</script>

<style lang="scss" scoped>
.tooltip-content {
  padding: 4px 10px;
}
</style>
