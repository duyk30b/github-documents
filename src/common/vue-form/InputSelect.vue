<template>
  <div ref="wrapperRef" class="input-select">
    <div
      :class="{ 'input-select-display': true, disabled }"
      :tabindex="tabindex"
      @click="toggleDropdown"
      @keydown="onKeyDown"
    >
      <div class="label">{{ selectedLabel }}</div>
      <div v-if="!isOpen" class="arrow">&#9662;</div>
      <div v-else class="arrow">&#9652;</div>
    </div>

    <!-- <div v-if="CONFIG.MODE === 'development'" class="development" style="color: violet">
      {{ randomId }} - {{ value }} - {{ options.length }}/{{ options.length }}
    </div> -->

    <!-- Teleport dropdown to body -->
    <teleport to="body">
      <transition :name="!transitionSlide ? '' : dropdownDirection === 'up' ? 'slide-up' : 'slide-down'">
        <div v-if="isOpen" ref="dropdownRef" class="input-select-dropdown" :style="dropdownStyle">
          <div
            v-for="(option, index) in options"
            :key="index"
            class="input-select-option"
            :class="{ active: index === highlightedIndex }"
            @click="selectOption(option)"
          >
            {{ option.label }}
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

export type InputSelectOption<T> = {
  value: string | number | null
  label: string
  data?: T
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    options: InputSelectOption<any>[]
    value: string | number | null | undefined
    height?: string
    disabled?: boolean
    transitionSlide?: boolean
    tabindex?: number
    required?: boolean
  }>(),
  {
    options: () => [],
    value: null,
    height: '260px',
    disabled: false,
    transitionSlide: false,
    tabindex: 0,
    required: false,
  },
)

const emit = defineEmits<{
  (e: 'update:value', value: string | number | null): void
  (e: 'selectItem', value: { value: any; label: string; data?: any }): void
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

const isOpen = ref(false)
const highlightedIndex = ref(-1)
const dropdownStyle = ref<Record<string, string>>({})
const dropdownDirection = ref<'up' | 'down'>('down')

const randomId = computed(() => {
  return Math.random().toString(36).substring(2)
})

const selectedLabel = computed(() => {
  return props.options.find((o) => o.value === props.value)?.label || 'Chọn...'
})

const toggleDropdown = async () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await nextTick()
    updateDropdownPosition()
    highlightedIndex.value = props.options.findIndex((o) => o.value === props.value)
  }
}

function updateDropdownPosition() {
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()

  const dropdownHeight = dropdownRef.value?.offsetHeight || 200
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow
  dropdownDirection.value = showAbove ? 'up' : 'down'

  dropdownStyle.value = {
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    maxHeight: props.height || '200px',
    top: showAbove ? `${rect.top + window.scrollY - dropdownHeight}px` : `${rect.bottom + window.scrollY}px`,
  }
}

function selectOption(option: InputSelectOption<any>) {
  emit('update:value', option.value)
  emit('selectItem', option)
  isOpen.value = false
}

function onClickOutside(e: MouseEvent) {
  if (
    wrapperRef.value &&
    !wrapperRef.value.contains(e.target as Node) &&
    (!dropdownRef.value || !dropdownRef.value.contains(e.target as Node))
  ) {
    isOpen.value = false
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      toggleDropdown()
      e.preventDefault()
    }
    return
  }

  if (e.key === 'ArrowDown') {
    highlightedIndex.value = (highlightedIndex.value + 1) % props.options.length
    e.preventDefault()
  } else if (e.key === 'ArrowUp') {
    highlightedIndex.value = (highlightedIndex.value - 1 + props.options.length) % props.options.length
    e.preventDefault()
  } else if (e.key === 'Enter') {
    const option = props.options[highlightedIndex.value]
    if (option) {
      selectOption(option)
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style lang="scss" scoped>
.input-select {
  font-size: 16px;
  position: relative;
  .input-select-display {
    padding: 4px 12px 4px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    background: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    &.disabled {
      cursor: not-allowed;
      background-color: #eeeeee;
      &:hover {
        border-color: #ccc;
      }
    }
    &:not(.disabled):hover {
      cursor: pointer;
      &:hover {
        border-color: #40a9ff;
      }
    }
    .label {
      flex-grow: 1;
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .arrow {
      font-size: 0.9em;
      transform: scaleX(1.6);
      color: #777;
    }
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
}

.input-select-dropdown {
  position: absolute;
  top: 0;
  left: 0;
  overflow: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ccc;
  background: white;
  z-index: 9999;
  .input-select-option {
    padding: 5px 12px 5px 12px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &:hover {
      background: #e9e9e9;
    }
    &.active {
      background-color: dodgerblue;
      color: #fff;
    }
  }
}

/* Slide xuống */
.slide-down-enter-active,
.slide-down-leave-active,
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    opacity 0.1s ease,
    transform 0.1s ease;
}

.slide-down-enter-to,
.slide-down-leave-from,
.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: scaleY(1) translateY(0);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: scaleY(1) translateY(-10px);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: scaleY(1) translateY(10px);
}
</style>
