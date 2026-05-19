<script setup lang="ts">
import { type StyleValue } from 'vue'

export type InputRadioOptionType = {
  key: string | number | boolean
  label: string
  disabled?: boolean
}

const props = defineProps<{
  value: string | number | boolean | undefined
  options: InputRadioOptionType[]
  disabled?: boolean
  customStyle?: {
    wrap?: StyleValue
    item?: StyleValue
  }
}>()
const emit = defineEmits<{
  (e: 'update:value', value: string | number | boolean): void
}>()

const handleChange = (e: Event, key: string | number | boolean) => {
  const checked = (e.target as HTMLInputElement).checked
  if (checked) {
    emit('update:value', key)
  }
}

defineExpose({ focus })
</script>

<template>
  <div class="vue-input-radio" :style="customStyle?.wrap || ''">
    <label
      :class="{ 'vue-input-radio-item': true, disabled }"
      v-for="(option, index) in options"
      :key="index"
      :style="customStyle?.item || ''"
    >
      <input
        type="radio"
        :checked="value === option.key"
        :disabled="!!disabled"
        @change="(e) => handleChange(e, option.key)"
      />
      <span
        :class="{
          'input-radio-fake': true,
          'input-radio-fake-checked': value === option.key,
          disabled,
        }"
      ></span>
      <span>{{ option.label }}</span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.vue-input-radio {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1em;
  .vue-input-radio-item {
    display: flex;
    align-items: center;
    gap: 0.5em;
    cursor: pointer;
    user-select: none;
    &.disabled {
      cursor: not-allowed;
    }
    &:hover {
      opacity: 1;
    }

    input {
      position: absolute;
      opacity: 0;
    }

    .input-radio-fake {
      position: relative;
      display: block;
      min-width: 16px;
      width: 16px;
      height: 16px;
      border: 1px solid #d9d9d9;
      border-radius: 50%;
      background-color: #fff;
      transition: all 0.2s;
      &::after {
        position: absolute;
        top: 50%;
        left: 50%;
        display: block;
        width: 100%;
        height: 100%;
        margin-top: -50%;
        margin-left: -50%;
        background-color: #1890ff;
        border-top: 0;
        border-left: 0;
        border-radius: 50%;
        transform: scale(0);
        opacity: 0;
        transition: all 0.2s cubic-bezier(0.78, 0.14, 0.15, 0.86);
        content: ' ';
      }
      &.disabled::after {
        background-color: #8b8b8b !important;
      }
      &.input-radio-fake-checked {
        border-color: #1890ff;
        &.disabled {
          border-color: #8b8b8b;
        }
        &::after {
          opacity: 1;
          transform: scale(0.5);
        }
      }
    }
  }
}
</style>
