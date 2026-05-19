<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue'
import { IconClose, IconCloseCircle } from '../icon-antd'

const props = withDefaults(
  defineProps<{
    value?: string | number | boolean | null
    options?: string[]
    disabled?: boolean
    placeholder?: string
    maxHeight?: number
    required?: boolean
    logicFilter?: (a: string, b: string | any) => boolean
  }>(),
  {
    value: null,
    options: () => [],
    disabled: false,
    placeholder: '',
    maxHeight: 300,
    required: false,
    logicFilter: () => true,
  },
)

const emit = defineEmits<{
  (e: 'update:value', value: string): void
}>()

const inputRef = ref<HTMLInputElement>()
const optionsElement = ref<HTMLElement>()

const indexFocus = ref<number>(-1)
const showOptions = ref<boolean>(false)

const optionsFilter = computed(() => {
  return props.options.filter((item) => {
    return props.logicFilter(item, props.value || '')
  })
})

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  indexFocus.value = -1
  showOptions.value = true
  emit('update:value', target.value)
}

const handleClickOutside = () => {
  showOptions.value = false
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Tab' || e.key === 'Escape') {
    showOptions.value = false
  } else if (e.key === 'ArrowDown') {
    indexFocus.value += 1
    if (indexFocus.value >= optionsFilter.value.length) indexFocus.value = 0
    setScrollOption('ArrowDown')
  } else if (e.key === 'ArrowUp') {
    indexFocus.value -= 1
    if (indexFocus.value < 0) indexFocus.value = optionsFilter.value.length - 1
    setScrollOption('ArrowUp')
  } else if (e.key === 'Enter') {
    e.preventDefault()
    showOptions.value = !showOptions.value
    if (indexFocus.value !== -1) {
      handleSelectItem(indexFocus.value)
    }
  }
}

const handleClickClear = () => {
  if (props.disabled) return
  indexFocus.value = -1
  showOptions.value = false
  emit('update:value', '')
}

const handleSelectItem = (index: number) => {
  indexFocus.value = -1
  showOptions.value = false
  emit('update:value', optionsFilter.value[index])
}

const setScrollOption = (type: 'ArrowUp' | 'ArrowDown') => {
  nextTick(() => {
    if (!optionsElement.value) return
    const activeItem = optionsElement.value.querySelector('.item-option.active') as HTMLElement
    if (!activeItem) return

    const topItem = activeItem.offsetTop
    const bottomItem = activeItem.offsetTop + activeItem.offsetHeight

    // nếu item vẫn đang trong khoảng có thể hiển thị thì không scroll
    if (
      topItem > optionsElement.value.scrollTop &&
      bottomItem < optionsElement.value.scrollTop + props.maxHeight
    ) {
      return
    }
    if (type === 'ArrowUp') optionsElement.value.scrollTop = topItem - 20
    if (type === 'ArrowDown') optionsElement.value.scrollTop = bottomItem - props.maxHeight + 20
  })
}

const focus = () => inputRef.value?.focus()
const clear = () => {
  emit('update:value', '')
}

defineExpose({ focus, clear })
</script>

<template>
  <div v-click-outside="handleClickOutside" :class="{ 'vue-input': true, disabled }">
    <div class="input-area">
      <input
        ref="inputRef"
        :value="value"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        @input="handleInput"
        @keydown="handleKeydown"
        @focusin="showOptions = true"
      />
    </div>
    <div class="icon-append">
      <IconClose
        style="font-size: 0.7em"
        v-if="!disabled"
        class="icon-clear-blur"
        @click="handleClickClear"
      />
      <IconCloseCircle
        style="font-size: 0.7em"
        v-if="!disabled"
        class="icon-clear-hover"
        @click="handleClickClear"
      />
    </div>
    <div
      v-if="showOptions"
      ref="optionsElement"
      class="options"
      :style="{ maxHeight: `${maxHeight}px` }"
    >
      <div
        v-for="(item, index) in optionsFilter"
        :key="index"
        :class="{ 'item-option': true, 'active': index == indexFocus }"
        @click="handleSelectItem(index)"
      >
        <slot name="option" :item="item" :index="index">
          <div class="item-text">{{ item }}</div>
        </slot>
      </div>
    </div>
  </div>
</template>
