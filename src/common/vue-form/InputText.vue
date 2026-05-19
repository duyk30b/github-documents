<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: string | null | undefined
    type?: 'text' | 'email' | 'url'
    name?: string
    prepend?: string
    append?: string
    disabled?: boolean
    required?: boolean
    textAlign?: 'left' | 'right'
    maxlength?: number
    placeholder?: string
    pattern?: string
    title?: string
    autocomplete?: 'on' | 'off'
  }>(),
  {
    value: '',
    type: 'text',
    name: undefined,
    prepend: undefined,
    append: undefined,
    disabled: false,
    required: false,
    textAlign: undefined,
    maxlength: undefined,
    placeholder: undefined,
    pattern: undefined,
    title: undefined,
    autocomplete: undefined,
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
    <div v-if="prepend" class="prepend">{{ prepend }}</div>
    <div class="input-area">
      <input
        ref="inputRef"
        :value="value"
        :name="name"
        :style="{ textAlign }"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        :pattern="pattern"
        :title="title"
        :type="type"
        @input="handleInput"
      />
    </div>
    <div v-if="append" class="append">{{ append }}</div>
  </div>
</template>

<style lang="scss" scoped>
.password-toggle {
  line-height: 0;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
