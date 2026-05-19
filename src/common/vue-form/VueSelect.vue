<script lang="ts" setup>
import { nextTick, ref, watch } from 'vue'
import { IconCaretDown, IconCaretUp } from '../icon-antd'

export type VueSelectOption<T> = {
  value: any
  text?: string
  data?: T
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    value?: any
    options: VueSelectOption<any>[]
    disabled?: boolean
    placeholder?: string
    maxHeight?: number
    required?: boolean
    iconClear?: boolean
    addOther?: boolean
  }>(),
  {
    value: null,
    options: () => [],
    disabled: false,
    placeholder: '',
    maxHeight: 300,
    required: false,
    iconClear: false,
    addOther: false,
  },
)

const emit = defineEmits<{
  (e: 'update:value', value: any): void
  (e: 'selectItem', value: { value?: any; text?: string; data?: any }): void
}>()

const inputRef = ref<HTMLInputElement>()
const indexFocus = ref<number>(-1)
const showOptions = ref<boolean>(false)
const itemSelected = ref<{ value?: any; text?: any; data?: any }>({})

const optionsElement = ref<HTMLElement>()
const optionsStringify = ref<string>('')

watch(
  () => props.value, // mục đích của watch value là để tìm và show ra text
  (newValue) => {
    const index = props.options.findIndex((item) => {
      if (typeof item.value === 'object') {
        return JSON.stringify(item.value) === JSON.stringify(newValue)
      } else {
        return item.value === newValue
      }
    })
    indexFocus.value = index
    itemSelected.value = index !== -1 ? props.options[index] : {}
  },
  { immediate: true },
)

watch(
  () => props.options, // mục đích của watch value là để tìm và show ra text
  (newOptions: VueSelectOption<any>[]) => {
    if (props.value == null) return // nếu không có value thì thôi, watch làm chi cho mệt
    const optionsStringifyNew = JSON.stringify(newOptions)
    if (optionsStringify.value === optionsStringifyNew) return
    optionsStringify.value = optionsStringifyNew

    const index = newOptions.findIndex((item) => {
      if (typeof item.value === 'object') {
        return JSON.stringify(item.value) === JSON.stringify(props.value)
      } else {
        return item.value === props.value
      }
    })
    indexFocus.value = index
    itemSelected.value = index !== -1 ? newOptions[index] : {}
  },
  { immediate: true },
)

const handleFocusin = () => {
  if (props.disabled) return
  showOptions.value = true
}

const handleClickMask = () => {
  if (props.disabled) return
  showOptions.value = true
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Tab' || e.key === 'Escape') {
    showOptions.value = false
  } else if (e.key === 'ArrowDown') {
    indexFocus.value += 1
    if (indexFocus.value >= props.options.length) indexFocus.value = 0
    setScrollOption('ArrowDown')
  } else if (e.key === 'ArrowUp') {
    indexFocus.value -= 1
    if (indexFocus.value < 0) indexFocus.value = props.options.length - 1
    setScrollOption('ArrowUp')
  } else if (e.key === 'Enter') {
    e.preventDefault()
    showOptions.value = !showOptions.value
    if (indexFocus.value !== -1) {
      handleSelectItem(indexFocus.value)
    }
  } else {
    e.preventDefault()
  }
}

const handleSelectItem = (index: number) => {
  indexFocus.value = index
  showOptions.value = false

  const item = props.options[index]
  const value = item.value
  if (value !== props.value) {
    emit('update:value', value)
    emit('selectItem', item) // phải để event này cuối cùng, để ghi đè: update:text
  }
}

const handleClear = () => {
  if (props.disabled) return
  showOptions.value = false
  indexFocus.value = -1
  itemSelected.value = {}
  emit('update:value', undefined)
  emit('selectItem', {})
  if (inputRef.value) {
    inputRef.value.value = ''
  }
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

defineExpose({ focus })
</script>
<template>
  <div
    :class="{ 'vue-input': true, disabled }"
    :tabindex="disabled ? -1 : 0"
    @focusin="handleFocusin"
    @blur="showOptions = false"
    @keydown="handleKeydown"
  >
    <div class="input-area">
      <input
        ref="inputRef"
        :required="required"
        :value="Object.keys(itemSelected).length || ''"
        disabled
      />
      <div class="mask" @click="handleClickMask">
        <slot name="text" :content="itemSelected">
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
            {{
              itemSelected.text != null
                ? itemSelected.text || '&nbsp;'
                : JSON.stringify(itemSelected.data)
            }}
          </div>
        </slot>
      </div>
    </div>
    <div v-if="!disabled" class="icon-append">
      <!-- đang có lỗi icon-clear trên iphone (click 2 lần mới focus được vào ô input) -->
      <!-- <template v-if="iconClear">
        <IconCaretDown class="icon-blur" />
        <IconClearOutline class="icon-clear-hover" @click="handleClear" />
        <IconClearCircle class="icon-clear-blur" @click="handleClear" />
      </template>
      <template v-else>
        <IconCaretDown v-if="!showOptions" />
        <IconCaretUp v-if="showOptions" />
      </template> -->
      <IconCaretDown v-if="!showOptions" />
      <IconCaretUp v-if="showOptions" />
    </div>
    <div
      v-if="showOptions"
      ref="optionsElement"
      class="options"
      :style="{ maxHeight: `${maxHeight}px` }"
    >
      <div
        v-for="(item, index) in options"
        :key="index"
        :style="
          !item.disabled
            ? 'cursor: pointer'
            : 'cursor: not-allowed; background-color: #eeeeee; opacity: 0.6;'
        "
        :class="{ 'item-option': true, 'active': index == indexFocus }"
        @click.stop="!item.disabled && handleSelectItem(index)"
      >
        <slot name="option" :item="item" :index="index">
          <div class="item-text">
            {{ item.text != null ? item.text || '&nbsp;' : JSON.stringify(item.data) }}
          </div>
        </slot>
      </div>
      <div v-if="addOther" class="item-option">
        <slot name="addOther"></slot>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.vue-input {
  cursor: pointer;
  &.disabled {
    cursor: not-allowed;
  }
  .input-area {
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 12px;
      bottom: 0;
      display: flex;
      align-items: center;
      padding: 0 0 0 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: none;
    }

    input {
      opacity: 0;
      cursor: pointer;
    }
  }
}
</style>
