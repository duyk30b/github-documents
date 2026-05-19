<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ value?: string; format?: string }>(), {
  value: '',
  format: 'xxxx.xxx.xxx',
})
const emit = defineEmits<{ (e: 'update:value', value: string | undefined): void }>()

const inputPhone = ref<HTMLInputElement>()

const ruleValidIndex = props.format.split('').reduce((acc, cur, index) => {
  if (cur === 'x') acc.push(index + 1)
  return acc
}, [] as number[])

watch(
  () => props.value,
  (newValue, oldValue) => {
    if (!inputPhone.value) return
    inputPhone.value.value = startFormatMask(newValue || '', props.format)
  },
  { immediate: true }
)

onMounted(() => {
  if (!inputPhone.value) return
  inputPhone.value.value = startFormatMask(props.value || '', props.format)
})

const startFormatMask = (text: string, format: string) => {
  const arrOrigin = text.replace(/[^\d]/g, '').split('')
  const arrFormat = format.split('')
  const arrResult = []

  for (let i = 0; i < arrFormat.length; i++) {
    if (arrOrigin.length === 0) break

    if (arrFormat[i] !== 'x') {
      arrResult.push(arrFormat[i]) // nếu là ký tự đặc biệt thì lấy ký tự đó
    } else {
      arrResult.push(arrOrigin.shift())
    }
  }
  return arrResult.join('')
}

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.value.length < props.format.length) {
    target.value = ''
    emit('update:value', undefined)
    return
  }
  emit('update:value', target.value.replace(/[^\d]/g, ''))
}

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const selectionStart = target.selectionStart || 0

  const value = startFormatMask(target.value, props.format)
  target.value = value

  // Đổi value của ô input làm cursor về cuối ô, cần chỉnh lại
  if ((e as InputEvent).inputType === 'deleteContentBackward') {
    for (let i = ruleValidIndex.length - 1; i >= 0; i--) {
      if (ruleValidIndex[i] <= selectionStart) {
        target.selectionStart = ruleValidIndex[i]
        target.selectionEnd = ruleValidIndex[i]
        break
      }
    }
  } else if ((e as InputEvent).inputType === 'insertText') {
    for (let i = 0; i < ruleValidIndex.length; i++) {
      if (ruleValidIndex[i] >= selectionStart) {
        target.selectionStart = ruleValidIndex[i]
        target.selectionEnd = ruleValidIndex[i]
        break
      }
    }
  }
}
</script>

<template>
  <input
    ref="inputPhone"
    type="text"
    :placeholder="props.format"
    inputmode="tel"
    @input="handleInput"
    @change="handleChange"
  />
</template>

<style lang="scss" scoped>
input {
  width: 100%;
  padding: 4px 11px;
  outline: none;
  border: 1px solid #d9d9d9;
  border-radius: 2px;

  &:focus {
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgb(24 144 255 / 20%);
  }

  &:hover {
    border-color: #40a9ff;
  }

  &::placeholder {
    opacity: 0.5;
  }

  &:disabled {
    cursor: not-allowed;
    border: 1px solid #d9d9d9;
    color: rgb(51, 51, 51, 0.8);
  }
}
</style>
