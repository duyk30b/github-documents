<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { IconSearch } from '../icon-antd'

export type ItemOption<T> = { value: number; text: string; data?: T }
export type ItemSearchOption<T> = { value: number; text: string; data?: T }

const props = withDefaults(
  defineProps<{
    value: number
    options: ItemSearchOption<any>[]
    disabled?: boolean
    placeholder?: string
    maxHeight?: number
    prepend?: string
    required?: boolean
    limit?: number
    logicFilter?: (item: ItemSearchOption<any>, text: string) => boolean
    clearTextIfNoSelect?: boolean
    messageNoResult?: string
  }>(),
  {
    value: 0,
    options: () => [],
    disabled: false,
    placeholder: '',
    maxHeight: 260,
    limit: 100,
    prepend: undefined,
    required: false,
    logicFilter: () => true,
    clearTextIfNoSelect: true,
    messageNoResult: 'Không tìm thấy kết quả phù hợp',
  },
)

const emit = defineEmits<{
  (e: 'searching', value: string): void
  (e: 'update:text', value: string): void
  (e: 'update:value', value: string | number | boolean | null): void
  (e: 'selectItem', value: ItemSearchOption<any> | undefined): void
}>()

const inputRef = ref<HTMLInputElement>()
const wrapperRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement>()
const dropdownStyle = ref<Record<string, string>>({})
const dropdownDirection = ref<'up' | 'down'>('down')

const searchText = ref('')
const indexFocus = ref<number>(-1)
const showOptions = ref<boolean>(false)

const currentValue = ref(0)
let propsText = '' // lấy text từ item select khi chọn

const randomId = computed(() => {
  return Math.random().toString(36).substring(2)
})

const optionsFilter = computed(() => {
  const optionsResult = []
  for (let i = 0; i < props.options.length; i++) {
    const item = props.options[i]
    if (props.logicFilter(item, searchText.value || '')) {
      optionsResult.push(item)
    }
    if (optionsResult.length >= props.limit) {
      break
    }
  }
  return optionsResult
})

watch(
  () => props.value,
  (newValue, oldValue) => {
    if (currentValue.value === newValue) return
    currentValue.value = newValue

    const findIndex = props.options.findIndex((item) => item.value === newValue)
    if (findIndex === -1) {
      searchText.value = ''
      propsText = ''
      emit('update:text', '')
    } else {
      const item = props.options[findIndex]
      searchText.value = item.text
      propsText = item.text
      // indexFocus.value = findIndex // muốn focus đến thằng nào đang giữ luôn, nhưng lỗi, chưa giải quyết được
      emit('update:text', item.text)
    }
  },
  { immediate: true },
)

let optionsLength = 0
watch(
  () => props.options,
  (newValue, oldValue) => {
    // không so sánh bằng JSON.stringify vì dễ gây lỗi
    // const optionsStringifyNew = JSON.stringify(props.options)
    // if (optionsStringify === optionsStringifyNew) return
    // optionsStringify = optionsStringifyNew

    // // so sánh bằng độ dài của mảng là cũng ok rồi mà
    if (optionsLength === props.options.length) return
    optionsLength = props.options.length

    if (!props.value) return

    const findIndex = newValue.findIndex((item) => item.value === props.value)
    if (findIndex === -1) {
      searchText.value = ''
      propsText = ''
      emit('update:text', '')
    } else {
      const item = props.options[findIndex]
      searchText.value = item.text || ''
      propsText = item.text || ''
      // indexFocus.value = findIndex // muốn focus đến thằng nào đang giữ luôn, nhưng lỗi, chưa giải quyết được
      emit('update:text', item.text)
    }
  },
  { immediate: true },
)

const updateDropdownPosition = async () => {
  if (!showOptions.value) return
  await nextTick()
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()

  // const dropdownHeight = dropdownRef.value?.offsetHeight || props.maxHeight // chưa hiểu lỗi gì mà ko lấy theo nó được
  const dropdownHeight = Math.min(
    dropdownRef.value?.offsetHeight || props.maxHeight,
    props.maxHeight,
  )
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow
  dropdownDirection.value = showAbove ? 'up' : 'down'

  dropdownStyle.value = {
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    maxHeight: props.maxHeight + 'px',
    top: showAbove
      ? `${rect.top + window.scrollY - dropdownHeight}px`
      : `${rect.bottom + window.scrollY}px`,
  }
}

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  indexFocus.value = -1
  showOptions.value = true

  currentValue.value = 0
  searchText.value = target.value
  emit('searching', target.value)
  emit('update:text', target.value)

  if (!searchText.value) {
    currentValue.value = 0
    if (props.value) {
      emit('update:value', 0)
      emit('selectItem', undefined)
    }
  } else {
    if (searchText.value === propsText) {
      currentValue.value = props.value
    }
  }
}

const handleClickOutside = () => {
  showOptions.value = false

  if (!currentValue.value) {
    if (props.clearTextIfNoSelect) {
      if (searchText.value) {
        searchText.value = ''
        emit('update:text', '')
      }
      if (propsText) propsText = ''
    }

    if (props.value) {
      emit('update:value', 0)
      emit('selectItem', undefined)
    }
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Tab' || e.key === 'Escape') {
    handleClickOutside()
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

  currentValue.value = item.value
  propsText = item.text || ''
  searchText.value = item.text || ''

  emit('update:text', item.text)
  emit('update:value', item.value)
  emit('selectItem', item) // phải để event này cuối cùng, để ghi đè: update:text
}

const setScrollOption = (type: 'ArrowUp' | 'ArrowDown') => {
  nextTick(() => {
    if (!dropdownRef.value) return
    const activeItem = dropdownRef.value.querySelector('.item-option.active') as HTMLElement
    if (!activeItem) return

    const topItem = activeItem.offsetTop
    const bottomItem = activeItem.offsetTop + activeItem.offsetHeight

    // nếu item vẫn đang trong khoảng có thể hiển thị thì không scroll
    if (
      topItem > dropdownRef.value.scrollTop &&
      bottomItem < dropdownRef.value.scrollTop + props.maxHeight
    ) {
      return
    }
    if (type === 'ArrowUp') dropdownRef.value.scrollTop = topItem - 20
    if (type === 'ArrowDown') dropdownRef.value.scrollTop = bottomItem - props.maxHeight + 20
  })
}

const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus()
    inputRef.value.selectionStart = inputRef.value.selectionEnd = inputRef.value.value.length
  }
}

const onFocusin = async () => {
  showOptions.value = true
  await updateDropdownPosition()
}

onMounted(() => {
  document.addEventListener('scroll', updateDropdownPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('scroll', updateDropdownPosition, true)
})

defineExpose({ focus })
</script>

<template>
  <div
    v-click-outside="handleClickOutside"
    :class="{ 'vue-input': true, disabled }"
    ref="wrapperRef"
  >
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
        @focusin="onFocusin"
      />
    </div>
    <div class="icon-append">
      <IconSearch class="icon-blur" />
      <!-- đang có lỗi icon-clear trên iphone (click 2 lần mới focus được vào ô input) -->
      <!-- <IconClearOutline class="icon-clear-hover" @click="handleClickClear" />
      <IconClearCircle class="icon-clear-blur" @click="handleClickClear" /> -->
    </div>
    <teleport to="body">
      <div v-if="showOptions" ref="dropdownRef" class="input-search-option" :style="dropdownStyle">
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
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
.vue-input {
  position: relative;
}
.prepend {
  min-width: 60px;
  text-align: center;
  justify-content: center;
  align-items: center;
}
.development {
  position: absolute;
  right: 5px;
  top: 0;
  font-size: 0.8em;
  transform: translate(0, -50%);
  background-color: rgba(255, 255, 255, 0.5);
  padding: 4px;
  white-space: nowrap;
}

.input-search-option {
  position: absolute;
  top: 0;
  left: 0;
  overflow: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ccc;
  background: white;
  z-index: 9999;
  .item-option {
    padding: 6px 12px;
    cursor: pointer;
    user-select: none;
    border-bottom: 1px solid #d4d4d4;

    &.active {
      background-color: dodgerblue !important;
      color: #fff;
    }

    &:hover {
      background-color: #e9e9e9;
    }

    .item-text {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}
</style>
