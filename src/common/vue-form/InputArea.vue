<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: string | null | undefined
    disabled?: boolean
    placeholder?: string
    rows?: number
  }>(),
  {
    value: '',
    disabled: false,
    placeholder: undefined,
  },
)
const emit = defineEmits<{ (e: 'update:value', value: string): void }>()

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:value', target.value)
}
</script>

<template>
  <div :class="{ 'vue-input': true, 'disabled': disabled }">
    <div class="input-area">
      <textarea
        style="width: 100%; height: 100%"
        :value="value"
        @input="handleInput"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows || 5"
      ></textarea>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
