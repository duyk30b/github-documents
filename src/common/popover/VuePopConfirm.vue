<template>
  <Popover
    :position="{ horizontal: 'center', vertical: 'top' }"
    :custom-style="{
      offset: 8,
      arrow: true,
      dropdownContent: {
        backgroundColor: 'white',
        boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.35)',
      },
    }"
  >
    <template #trigger>
      <slot name="trigger"></slot>
    </template>
    <template #content>
      <slot></slot>
    </template>
  </Popover>
</template>

<script lang="ts" setup>
import Popover from './Popover.vue'
</script>

<style lang="scss" scoped></style>
