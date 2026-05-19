<template>
  <div ref="dropdownTriggerRef" class="dropdown-trigger">
    <slot name="trigger"></slot>
    <Teleport to="body">
      <Transition :name="position.vertical === 'top' ? 'slide-up' : 'slide-down'">
        <div
          v-if="isOpen"
          ref="dropdownContentRef"
          class="dropdown-content"
          :class="isClick ? 'dropdown-content-clicked' : ''"
          :style="customStyle?.dropdownContent || ''"
        >
          <!-- Lỗi sinh ra 1 cái scroll mà chưa biết sửa thế nào -->
          <!-- <div
            v-if="customStyle?.arrow"
            class="dropdown-arrow"
            :style="customStyle?.dropdownArrow || ''"
            :class="`arrow-${positionFix.vertical} arrow-${positionFix.horizontal}`"
            ref="dropdownArrowRef"
          ></div> --> 
          <slot name="content"></slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  type PropType,
  type StyleValue,
} from 'vue'

const dropdownTriggerRef = ref<HTMLElement | null>(null)
const dropdownContentRef = ref<HTMLElement | null>(null)
const dropdownArrowRef = ref<HTMLElement>(null as any)

const props = defineProps({
  position: {
    type: Object as PropType<{
      vertical: 'top' | 'bottom' | 'middle'
      horizontal: 'start' | 'end' | 'center'
    }>,
    default: () => ({ vertical: 'top', horizontal: 'center' }),
  },
  showOnHover: { type: Boolean, default: false },
  customStyle: {
    type: Object as PropType<{
      offset?: number
      arrow?: boolean
      dropdownContent?: StyleValue
      dropdownArrow?: StyleValue
    }>,
  },
  delayHide: { type: Number, default: 1000 },
})

const positionFix = reactive<{
  vertical: 'top' | 'bottom' | 'middle'
  horizontal: 'start' | 'end' | 'center'
  maxHeightFix: boolean
  maxHeightValue: number
}>({
  vertical: props.position.vertical,
  horizontal: props.position.horizontal,
  maxHeightFix: false,
  maxHeightValue: 0,
})

const isOpen = ref(false)
let isHover = false
const isClick = ref(false)

const calculatePosition = () => {
  if (!dropdownTriggerRef.value || !dropdownContentRef.value || !isOpen.value) return

  const triggerRect = dropdownTriggerRef.value.getBoundingClientRect()
  const dropdownRect = dropdownContentRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  const spaceBelow = viewportHeight - triggerRect.bottom - 20
  const spaceAbove = triggerRect.top - 20
  const spaceRight = viewportWidth - triggerRect.left
  const spaceLeft = triggerRect.left

  const spaceDropdownRectHeight =
    props.position.vertical === 'middle' ? dropdownRect.height / 2 : dropdownRect.height
  if (
    props.position.vertical !== 'top' &&
    spaceBelow < spaceDropdownRectHeight &&
    spaceBelow <= spaceAbove
  ) {
    positionFix.vertical = 'top'
  } else if (
    props.position.vertical !== 'bottom' &&
    spaceAbove < spaceDropdownRectHeight &&
    spaceAbove <= spaceBelow
  ) {
    positionFix.vertical = 'bottom'
  } else {
    positionFix.vertical = props.position.vertical
  }

  if (positionFix.vertical === 'top') {
    if (spaceAbove < spaceDropdownRectHeight) {
      positionFix.maxHeightFix = true
      positionFix.maxHeightValue = Math.floor(spaceAbove)
    }
  } else if (positionFix.vertical === 'bottom') {
    if (spaceBelow < spaceDropdownRectHeight) {
      positionFix.maxHeightFix = true
      positionFix.maxHeightValue = Math.floor(spaceBelow)
    }
  }

  const spaceDropdownRectWidth =
    props.position.horizontal === 'center' ? dropdownRect.width / 2 : dropdownRect.width
  if (props.position.horizontal !== 'end' && spaceRight < spaceDropdownRectWidth) {
    positionFix.horizontal = 'end'
  } else if (props.position.horizontal !== 'start' && spaceLeft < spaceDropdownRectWidth) {
    positionFix.horizontal = 'start'
  } else {
    positionFix.horizontal = props.position.horizontal
  }

  // Start edit CSS
  if (positionFix.vertical === 'top') {
    const topCalculator =
      triggerRect.top - dropdownRect.height + window.scrollY - (props.customStyle?.offset || 0)
    dropdownContentRef.value.style.top = Math.max(topCalculator, 10) + 'px'
    dropdownContentRef.value.style.transformOrigin = 'bottom'
  } else if (positionFix.vertical === 'bottom') {
    dropdownContentRef.value.style.top =
      triggerRect.bottom + window.scrollY + (props.customStyle?.offset || 0) + 'px'
    dropdownContentRef.value.style.transformOrigin = 'top'
  }

  if (positionFix.horizontal === 'start') {
    dropdownContentRef.value.style.left = triggerRect.left + window.scrollX + 'px'
    if (dropdownArrowRef.value) {
      if (triggerRect.width < 50) {
        dropdownArrowRef.value.style.left = triggerRect.width / 2 + 'px'
        dropdownArrowRef.value.style.transform = 'translateX(-50%)'
      } else {
        dropdownArrowRef.value.style.left = '1rem'
      }
    }
  } else if (positionFix.horizontal === 'end') {
    dropdownContentRef.value.style.left =
      triggerRect.right - dropdownRect.width + window.scrollX + 'px'
    if (dropdownArrowRef.value) {
      if (triggerRect.width < 50) {
        dropdownArrowRef.value.style.right = triggerRect.width / 2 + 'px'
        dropdownArrowRef.value.style.transform = 'translateX(50%)'
      } else {
        dropdownArrowRef.value.style.right = '1rem'
      }
    }
  } else if (positionFix.horizontal === 'center') {
    dropdownContentRef.value.style.left =
      triggerRect.left + triggerRect.width / 2 - dropdownRect.width / 2 + window.scrollX + 'px'
    if (dropdownArrowRef.value) {
      dropdownArrowRef.value.style.left = '50%'
      dropdownArrowRef.value.style.transform = 'translateX(-50%)'
    }
  }

  if (positionFix.maxHeightFix) {
    dropdownContentRef.value.style.maxHeight = positionFix.maxHeightValue + 'px'
    dropdownContentRef.value.style.height =
      Math.min(positionFix.maxHeightValue, dropdownRect.height) + 'px'
  }
}

const handleClickDocument = async (event: MouseEvent) => {
  if (!dropdownTriggerRef.value) return
  if (dropdownTriggerRef.value.contains(event.target as any)) {
    isClick.value = true
    isOpen.value = true
    await nextTick()
    calculatePosition()
  }
  if (
    !dropdownTriggerRef.value.contains(event.target as any) &&
    !dropdownContentRef.value?.contains(event.target as any)
  ) {
    isClick.value = false
    isOpen.value = false
  }
}

let timeout = null as any
const handleMouseOverDocument = async (event: MouseEvent) => {
  if (!dropdownTriggerRef.value || !props.showOnHover) return
  if (
    !dropdownTriggerRef.value.contains(event.target as any) &&
    !dropdownContentRef.value?.contains(event.target as any)
  ) {
    isHover = false
    if (isOpen.value) {
      if (!timeout) {
        timeout = setTimeout(() => {
          if (isHover === false && !isClick.value) {
            isOpen.value = false
          }
        }, props.delayHide)
      }
    }
  }
  if (dropdownTriggerRef.value.contains(event.target as any)) {
    isHover = true
    isOpen.value = true
    await nextTick()
    calculatePosition()
    if (timeout != null) {
      clearTimeout(timeout)
      timeout = null
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickDocument)
  document.addEventListener('mouseover', handleMouseOverDocument)
  document.addEventListener('scroll', calculatePosition, true)
  // document.addEventListener('resize', calculatePosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickDocument)
  document.removeEventListener('mouseover', handleMouseOverDocument)
  document.removeEventListener('scroll', calculatePosition, true)
  // document.removeEventListener('resize', calculatePosition, true)
  if (timeout != null) {
    clearTimeout(timeout)
    timeout = null
  }
})
</script>

<style lang="scss" scoped>
.dropdown-trigger {
  position: relative;
}

.dropdown-content {
  position: absolute;
  z-index: 99999;
  border-radius: 4px;
  box-shadow: 2px 2px 20px rgba(0, 0, 0, 0.15);
  background-color: white;
  color: #333;
  top: 0; // quan trọng, nếu không set top, mặc định nó sẽ rơi xuống dưới, khi đó thanh scroll xuất hiện đẩy lệch mọi thứ đi
  left: 0;
  overflow: auto;
  &.dropdown-content-clicked {
    border: 1px solid #cdcdcd;
  }
  .dropdown-arrow {
    position: absolute;
    width: 10px;
    height: 6px;
    background-color: white;
    &.arrow-top {
      top: calc(100% - 1px);
      clip-path: polygon(0 0, 50% 100%, 100% 0);
    }
    &.arrow-bottom {
      top: -6px;
      clip-path: polygon(0 100%, 50% 0, 100% 100%);
    }
  }
}

.slide-down-enter-active,
.slide-down-leave-active,
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
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
