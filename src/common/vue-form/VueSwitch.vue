<template>
  <button
    type="button"
    :class="['toggle-switch', { 'is-checked': modelValue, 'is-disabled': disabled }]"
    @click="toggle"
    :style="`--size: ${size};`"
    :disabled="disabled"
    :aria-checked="!!modelValue"
    role="switch"
  >
    <div class="toggle-switch-handle"></div>
  </button>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue'

const props = defineProps({
  modelValue: { type: [Boolean, Number], default: false, required: true },
  disabled: { type: Boolean, default: false },
  typeParser: { type: String as PropType<'boolean' | 'number'>, default: 'boolean' },
  size: { type: String, default: '22px' },
  loading: { type: Boolean, default: false },
  checkedColor: { type: String, default: '#1890ff' },
  uncheckedColor: { type: String, default: 'rgba(0, 0, 0, 0.25)' },
})

const bgColor = computed(() => {
  return props.modelValue ? props.checkedColor : props.uncheckedColor
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean | number): void
  (e: 'change', value: boolean | number): void
}>()

const toggle = () => {
  if (props.disabled || props.loading) {
    return
  }
  let newValue: boolean | number = !props.modelValue
  if (props.typeParser === 'number') {
    newValue = Number(newValue)
  }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style lang="scss" scoped>
.toggle-switch {
  --size: 24px;
  --size-extension: calc(var(--size) + var(--size) / 4);

  position: relative;
  display: inline-block;
  box-sizing: border-box;
  width: calc(var(--size) * 2);
  height: var(--size);
  border-radius: calc(var(--size) / 2);
  background-color: v-bind('bgColor');
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  outline: none;

  // Xử lý nút trượt
  .toggle-switch-handle {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--size);
    height: var(--size);
    border: 2px solid v-bind('bgColor');
    border-radius: calc(var(--size) / 2);
    background-color: #fff;
    transition: all 0.2s;
    box-shadow: 0 2px 4px 0 rgba(0, 35, 11, 0.2);
  }

  // Trạng thái checked
  &.is-checked {
    .toggle-switch-handle {
      left: calc(100% - var(--size));
    }
  }

  // Khi đang click
  &:not(.is-disabled):active {
    .toggle-switch-handle {
      width: var(--size-extension);
    }
  }

  // Khi checked và active
  &.is-checked:not(.is-disabled):active {
    .toggle-switch-handle {
      left: calc(100% - var(--size-extension));
    }
  }

  // Trạng thái disabled
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
}
</style>
