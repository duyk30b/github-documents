<script setup lang="ts">
import { ref } from 'vue'
import { IconEye, IconEyeInvisible } from '../icon-antd'

const props = withDefaults(
  defineProps<{
    value: string | null | undefined
    name?: string
    disabled?: boolean
    required?: boolean
    maxlength?: number
    placeholder?: string
    autocomplete?: 'on' | 'off'
  }>(),
  {
    value: '',
    name: undefined,
    disabled: false,
    required: false,
    maxlength: undefined,
    placeholder: undefined,
    autocomplete: undefined,
  },
)
const emit = defineEmits<{ (e: 'update:value', value: string): void }>()

const showPassword = ref(false)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:value', target.value)
}
</script>

<template>
  <div :class="{ 'vue-input': true, 'disabled': disabled }">
    <div class="input-area" style="gap: 4px;">
      <input
        ref="inputRef"
        :value="value"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        :type="showPassword ? 'text' : 'password'"
        @input="handleInput"
      />
      <div v-if="showPassword" @click="showPassword = !showPassword" class="password-toggle">
        <IconEyeInvisible />
      </div>
      <div v-else @click="showPassword = !showPassword" class="password-toggle">
        <IconEye />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.password-toggle {
  padding-right: 0.5em;
  cursor: pointer;
}
</style>
