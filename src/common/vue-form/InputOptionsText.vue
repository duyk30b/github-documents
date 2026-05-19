<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { IconSearch } from '../icon-antd'

export type ItemOption = { value?: any; text: string; data?: any }

const props = withDefaults(
  defineProps<{
    text?: string
    options?: ItemOption[]
    disabled?: boolean
    placeholder?: string
    maxHeight?: number
    prepend?: string
    required?: boolean
    logicFilter?: (data: object, text: string) => boolean
    messageNoResult?: string
  }>(),
  {
    text: '',
    options: () => [],
    disabled: false,
    placeholder: '',
    prepend: undefined,
    maxHeight: 300,
    required: false,
    logicFilter: () => true,
    messageNoResult: 'Không tìm thấy kết quả phù hợp',
  },
)

const emit = defineEmits<{
  (e: 'searching', value: string): void
  (e: 'update:text', value: string): void
  (e: 'selectItem', value: ItemOption): void
}>()

const inputRef = ref<HTMLInputElement>()
const optionsElement = ref<HTMLElement>()

const searchText = ref('')
const indexFocus = ref<number>(-1)
const showOptions = ref<boolean>(false)
const itemSelected = ref<ItemOption>({ text: '' })

const optionsFilter = computed(() => {
  return props.options.filter((item) => {
    return props.logicFilter(item, searchText.value || '')
  })
})

watch(
  () => props.text,
  (newValue, oldValue) => {
    if (searchText.value !== newValue) {
      searchText.value = newValue
    }
  },
  { immediate: true },
)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  indexFocus.value = -1
  showOptions.value = true

  searchText.value = target.value
  emit('searching', target.value)
  emit('update:text', target.value)
}

const handleClickOutside = () => {
  if (showOptions.value !== false) {
    showOptions.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Tab' || e.key === 'Escape') {
    if (showOptions.value !== false) {
      showOptions.value = false
    }
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

const handleSelectItem = (index: number) => {
  indexFocus.value = -1
  showOptions.value = false

  const item = optionsFilter.value[index]

  searchText.value = item.text
  itemSelected.value = item

  emit('update:text', item.text)
  emit('selectItem', item) // phải để event này cuối cùng, để ghi đè: update:text
}

const setScrollOption = (type: 'ArrowUp' | 'ArrowDown') => {
  nextTick(() => {
    if (!optionsElement.value) return
    const activeItem = optionsElement.value.querySelector('.item-option.active') as HTMLElement
    if (!activeItem) return

    const topItem = activeItem.offsetTop
    const bottomItem = activeItem.offsetTop + activeItem.offsetHeight

    // nếu item vẫn đang trong khoảng có thể hiển thị thì không scroll
    if (topItem > optionsElement.value.scrollTop && bottomItem < optionsElement.value.scrollTop + props.maxHeight) {
      return
    }
    if (type === 'ArrowUp') optionsElement.value.scrollTop = topItem - 20
    if (type === 'ArrowDown') optionsElement.value.scrollTop = bottomItem - props.maxHeight + 20
  })
}

const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus()
    inputRef.value.selectionStart = inputRef.value.selectionEnd = inputRef.value.value.length
  }
}
const clear = () => {
  itemSelected.value = { text: '' }
  searchText.value = ''
}

defineExpose({ focus, clear })
</script>

<template>
  <div v-click-outside="handleClickOutside" :class="{ 'vue-input': true, disabled }">
    <div v-if="prepend" class="prepend">
      <span>{{ prepend }}</span>
    </div>
    <div class="input-area">
      <input
        ref="inputRef"
        :value="searchText"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        @input="handleInput"
        @keydown="handleKeydown"
      />
    </div>
    <div class="icon-append">
      <IconSearch class="icon-blur" />
      <!-- đang có lỗi icon-clear trên iphone (click 2 lần mới focus được vào ô input) -->
      <!-- <IconClearOutline class="icon-clear-hover" @click="handleClickClear" />
      <IconClearCircle class="icon-clear-blur" @click="handleClickClear" /> -->
    </div>
    <div v-if="showOptions" ref="optionsElement" class="options" :style="{ maxHeight: `${maxHeight}px` }">
      <div
        v-for="(item, index) in optionsFilter"
        :key="index"
        :class="{ 'item-option': true, 'active': index == indexFocus }"
        @click="handleSelectItem(index)"
      >
        <slot name="option" :item="item" :index="index">
          <div class="item-text">{{ item.text }}</div>
        </slot>
      </div>
      <div
        v-if="!!messageNoResult && !optionsFilter.length && searchText"
        class="item-option"
        style="font-style: italic"
      >
        {{ messageNoResult }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.prepend {
  min-width: 60px;
  text-align: center;
  justify-content: center;
  align-items: center;
}
</style>
