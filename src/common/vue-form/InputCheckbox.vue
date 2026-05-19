<script setup lang="ts">
import { computed, type StyleValue } from 'vue'

const props = withDefaults(
  defineProps<{
    value?: number | boolean
    checked?: boolean
    typeParser?: 'number' | 'boolean'
    indeterminate?: boolean
    label?: string
    disabled?: boolean
    customStyle?: {
      wrap?: StyleValue
      item?: StyleValue
    }
  }>(),
  {
    value: false,
    checked: false,
    typeParser: 'boolean',
    indeterminate: false,
    label: '',
    disabled: false,
  },
)
const emit = defineEmits<{
  (e: 'update:value', value: number | boolean | number): void
  (e: 'update:checked', value: boolean): void
  (e: 'change', event: Event): void
}>()

const handleChangeCheckbox = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:checked', target.checked)
  if (props.typeParser === 'number') {
    emit('update:value', Number(target.checked))
  }
  if (props.typeParser === 'boolean') {
    emit('update:value', target.checked)
  }
  emit('change', e)
}

defineExpose({ focus })
</script>

<template>
  <div class="vue-input-checkbox">
    <label class="vue-input-checkbox-item">
      <input
        type="checkbox"
        :checked="Boolean(value) || checked"
        :indeterminate="indeterminate"
        :disabled="disabled"
        @change="(e) => handleChangeCheckbox(e)"
      />
      <span
        :class="{
          'input-checkbox-fake': true,
          'input-checkbox-fake-checked': Boolean(value) || checked,
          'input-checkbox-fake-indeterminate': indeterminate,
          disabled,
        }"
      ></span>
      <span v-if="label">{{ label }}</span>
      <slot></slot>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.vue-input-checkbox {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1em;
  .vue-input-checkbox-item {
    position: relative; // ✅ Thêm dòng này
    display: inline-flex; // 👌 Nên dùng inline-flex thay vì flex full-width
    width: fit-content; // ✅ Giới hạn vùng label, tránh kéo dài
    align-items: center;
    gap: 0.5em;
    cursor: pointer;
    user-select: none;
    &:hover {
      opacity: 1;
    }

    input {
      position: absolute;
      opacity: 0;
    }

    .input-checkbox-fake {
      position: relative;
      display: block;
      width: 16px;
      min-width: 16px;
      height: 16px;
      direction: ltr;

      background-color: #fff;
      border: 1px solid #d9d9d9;
      border-radius: 2px;
      border-collapse: separate;
      transition: all 0.2s;
      &::after {
        position: absolute;
        top: 50%;
        left: 21.5%;
        display: block;
        width: 5px;
        height: 9px;
        border: 2px solid #fff;
        border-top: 0 !important;
        border-left: 0 !important;
        transform: rotate(45deg) scale(0) translate(-50%, -50%);
        opacity: 0;
        transition:
          all 0.1s cubic-bezier(0.71, -0.46, 0.88, 0.6),
          opacity 0.1s;
        content: ' ';
      }
      &.disabled {
        background-color: #eeeeee !important;
        cursor: not-allowed;
      }
      &.input-checkbox-fake-checked {
        background-color: #1890ff;
        border-color: #1890ff;
        &::after {
          transform: rotate(45deg) scale(1) translate(-50%, -50%);
          opacity: 1;
          transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
        }
        &.disabled {
          background-color: #eeeeee !important;
          border-color: #eeeeee !important;
          &::after {
            border: 2px solid #555;
          }
        }
      }
      &.input-checkbox-fake-indeterminate {
        background-color: #fff;
        border-color: #d9d9d9;
        &::after {
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          background-color: #1890ff;
          border: 0;
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
          content: ' ';
        }
        &.disabled {
          background-color: #eeeeee !important;
          border-color: #eeeeee !important;
          &::after {
            border: 2px solid #555;
          }
        }
      }
    }
  }
}
</style>
