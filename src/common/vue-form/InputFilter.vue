<script lang="ts" setup>
import { computed, nextTick, onUpdated, ref, watch } from 'vue'
import { ESString } from '../../utils'
import { IconSearch } from '../icon-antd'

const props = withDefaults(
  defineProps<{
    value?: string | number | boolean | null // value giống như id, ko nên truyền giá trị 0 hoặc '' để tránh phát sinh lỗi
    text?: string
    options?: { value: number | string; text: string; data: Record<string, any> }[]
    disabled?: boolean
    placeholder?: string
    maxHeight?: number
    required?: boolean
    logicFilter?: Function
    messageNoResult?: string
    noClearTextWhenNotSelected?: boolean
  }>(),
  {
    value: null,
    text: '',
    options: () => [],
    disabled: false,
    placeholder: '',
    maxHeight: 300,
    required: false,
    logicFilter: (
      item: { value: number | string; text: string; data: Record<string, any> },
      text: string,
    ) => {
      return ESString.customFilter(item.text, text)
    },
    messageNoResult: 'Không tìm thấy kết quả phù hợp',
    noClearTextWhenNotSelected: false,
  },
)

const emit = defineEmits<{
  (e: 'update:value', value: string | number | boolean | null): void
  (e: 'update:text', text: string): void
  (e: 'update:item', item: { value: any; text: string; data: any }): void
  (e: 'searching', text: string): void
  (e: 'selectItem', item: { value: any; text: string; data: any }): void
  (e: 'onFocusin'): void
}>()

const inputRef = ref<HTMLInputElement>()
const optionsElement = ref<HTMLElement>()

const searchText = ref('')
let dataSelected: any = null

const indexFocus = ref<number>(-1)
const showOptions = ref<boolean>(false)

const optionsStringify = ref<string>('')

const optionsFilter = computed(() => {
  return props.options.filter((item) => {
    return props.logicFilter(item, searchText.value || '')
  })
})

const randomId = computed(() => Math.random().toString(36).substring(2))
onUpdated(() => {
  // console.log(`InputFilter ${randomId.value} rerender`)
})

watch(
  () => props.options, // mục đích của watch value là để tìm và show ra text
  (newOptions: { value: any; text: string; data?: any }[]) => {
    if (!props.value) return // nếu không có value thì thôi, watch làm chi cho mệt
    const optionsStringifyNew = JSON.stringify(newOptions)
    if (optionsStringify.value === optionsStringifyNew) return

    optionsStringify.value = optionsStringifyNew

    const findIndex = newOptions.findIndex((item) => item.value === props.value)
    if (findIndex === -1) {
      searchText.value = ''
    } else {
      const item = newOptions[findIndex]
      // indexFocus.value = findIndex // muốn focus đến thằng nào đang giữ luôn, nhưng lỗi, chưa giải quyết được
      searchText.value = item.text
    }
  },
  { immediate: true },
)

watch(
  () => props.text,
  (newVal) => {
    if (searchText.value != newVal) {
      searchText.value = newVal || ''
    }
  },
  { immediate: true },
)

watch(
  () => props.value, // mục đích của watch value là để tìm và show ra text
  (newVal) => {
    if (newVal == null) return
    const findIndex = props.options.findIndex((item) => item.value === newVal)
    if (findIndex === -1) {
      searchText.value = ''
    } else {
      const item = props.options[findIndex]
      searchText.value = item.text
    }
  },
  { immediate: true },
)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  indexFocus.value = -1
  showOptions.value = true

  const text = target.value || ''
  searchText.value = text

  emit('searching', text)
  if (props.value != null) {
    emit('update:value', null)
  }
  emit('update:text', text)
  emit('update:item', { value: null, text, data: {} })

  if (dataSelected && !text) {
    dataSelected = null
    emit('selectItem', { text: '', value: null, data: null })
  }
}

const handleClickOutside = () => {
  showOptions.value = false
  if (props.value == null) {
    if (searchText.value && !props.noClearTextWhenNotSelected) {
      searchText.value = ''
      emit('update:text', '')
    }
    if (dataSelected && !props.noClearTextWhenNotSelected) {
      dataSelected = ''
      emit('update:item', { text: '', value: null, data: null })
      emit('selectItem', { text: '', value: null, data: null })
    }
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Tab' || e.key === 'Escape') {
    showOptions.value = false
    if (props.value == null && !props.noClearTextWhenNotSelected) {
      searchText.value = ''
      emit('update:text', '')
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
  dataSelected = item

  emit('update:value', item.value)
  emit('update:item', item)
  emit('selectItem', item)
  emit('update:text', item.text)
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

const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus()
    inputRef.value.selectionStart = inputRef.value.selectionEnd = inputRef.value.value.length
  }
}

const onFocusin = () => {
  showOptions.value = true
  emit('onFocusin')
}

defineExpose({ focus })
</script>

<template>
  <div v-click-outside="handleClickOutside" :class="{ 'vue-input': true, disabled }">
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
        @focusin="onFocusin"
      />
    </div>
    <div class="icon-append">
      <IconSearch class="icon-blur" />
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

<style lang="scss" scoped></style>
