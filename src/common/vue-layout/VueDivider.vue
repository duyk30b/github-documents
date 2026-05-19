<template>
  <div :class="`vue-divider divider-${orientation} divider-text-${textAlign}`">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { type PropType } from 'vue'

const props = defineProps({
  orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  textAlign: { type: String as PropType<'left' | 'right' | 'center'>, default: 'center' },
  borderStyle: { type: String as PropType<'solid' | 'dashed' | 'dotted'>, default: 'solid' },
  borderWidth: { type: String, default: '1px' },
  borderColor: { type: String, default: 'rgba(5, 5, 5, 0.1)' },
})

// Expose slots for use in the template
</script>

<style lang="scss" scoped>
.vue-divider {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif;
  white-space: nowrap;

  &::before,
  &::after {
    position: relative;
    width: 50%;
    transform: translateY(50%);
    border-block-start-style: v-bind('borderStyle');
    border-block-start-width: v-bind('borderWidth');
    border-block-start-color: v-bind('borderColor');
    content: '';
  }

  &.divider-horizontal {
    display: flex;
    clear: both;
    width: 100%;
  }

  &.divider-vertical {
    display: inline-block;
    height: 0.9em;
    margin: 0 8px;
    vertical-align: middle;
    border-inline-start-style: v-bind('borderStyle');
    border-inline-start-width: v-bind('borderWidth');
    border-inline-start-color: v-bind('borderColor');
  }

  &.divider-text-left {
    &::before {
      width: 5%;
    }
    &::after {
      width: 95%;
    }
  }

  &.divider-text-right {
    &::before {
      width: 95%;
    }
    &::after {
      width: 5%;
    }
  }
}
</style>
