<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { IconCalendar } from '../icon-antd'
import DatePickerRanger from './DatePickerRanger.vue'
import { IconClose, IconCloseCircle } from '../icon-antd'
import Popover from '../popover/Popover.vue'

const props = withDefaults(
  defineProps<{
    value?: string | number | Date | null
    typeParser?: 'number' | 'string' | 'object'
    disabled?: boolean
  }>(),
  {
    value: undefined,
    typeParser: 'string',
    disabled: false,
  },
)
const emit = defineEmits<{
  (e: 'update:value', value: string | number | Date | null | undefined): void
  (e: 'selectTime', value: string | number | Date | null | undefined): void
}>()

const inputYear = ref<HTMLElement>()
const inputMonth = ref<HTMLElement>()
const inputDate = ref<HTMLElement>()

const showDatePickerRanger = ref<boolean>(false)

onMounted(() => {
  watch(
    () => [props.value],
    ([newTime, newYear], oldValue) => {
      const newDate = new Date(newTime as any)
      if (newTime === null || newDate.toString() == 'Invalid Date') {
        inputDate.value!.innerHTML = ''
        inputMonth.value!.innerHTML = ''
        inputYear.value!.innerHTML = newYear != null ? newYear.toString() : ''
        return
      }
      const currentTime = getCurrentTime({ requireLength: true })
      if (currentTime?.getTime() === newDate.getTime()) return

      inputYear.value!.innerHTML = newDate.getFullYear().toString()

      inputMonth.value!.innerHTML = Number(newDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')
      inputDate.value!.innerHTML = newDate.getDate().toString().padStart(2, '0')
    },
    { immediate: true },
  )
})

const handleInput = (e: Event, type: 'YEAR' | 'MONTH' | 'DATE' | 'HOUR' | 'MINUTE' | 'SECOND') => {
  let CONFIG = { LENGTH: 0, MAX: 0 }

  if (type === 'YEAR') CONFIG = { LENGTH: 4, MAX: 9999 }
  else if (type === 'MONTH') CONFIG = { LENGTH: 2, MAX: 12 }
  else if (type === 'DATE') CONFIG = { LENGTH: 2, MAX: 31 }
  else if (type === 'HOUR') CONFIG = { LENGTH: 2, MAX: 23 }
  else if (type === 'MINUTE') CONFIG = { LENGTH: 2, MAX: 60 }
  else if (type === 'SECOND') CONFIG = { LENGTH: 2, MAX: 60 }

  const target = e.target as HTMLElement
  const beforeValue = target.textContent || ''
  const range = document.createRange()
  const selection = window.getSelection()
  const selectionStart = selection?.getRangeAt(0)?.startOffset || selection?.anchorOffset || 0

  let convert = beforeValue.replace(/[^\d/]/g, '').slice(0, CONFIG.LENGTH)
  if (Number(convert) > CONFIG.MAX) {
    convert = convert.slice(0, 1)
  }
  const afterValue = convert
  target.textContent = afterValue

  if (target.childNodes[0]) {
    range.setStart(target.childNodes[0], selectionStart + afterValue.length - beforeValue.length)
    range.setEnd(target.childNodes[0], selectionStart + afterValue.length - beforeValue.length)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  if (afterValue.length >= CONFIG.LENGTH) {
    if (type === 'DATE') inputMonth.value?.focus()
    if (type === 'MONTH') inputYear.value?.focus()
  }
}

const handleFocus = (e: Event) => {
  const target = e.target as HTMLElement
  const range = document.createRange()
  const selection = window.getSelection()
  if (target?.childNodes?.[0]) {
    range.selectNodeContents(target) // Chọn toàn bộ nội dung của div
    range.collapse(false) // focus thì xuống cuối câu
    selection?.removeAllRanges() // Xóa tất cả các range hiện tại
    selection?.addRange(range) // Thêm range mới để bôi đen toàn bộ nội dung
  }
}

const handleBlur = (e: Event, LENGTH = 2) => {
  const target = e.target as HTMLElement
  const beforeValue = target.textContent || ''
  if (!beforeValue) {
    return emit('update:value', undefined)
  }
  const newValue = beforeValue.padStart(LENGTH, '0')
  target.innerHTML = newValue

  const time = getCurrentTime({ requireLength: true })
  if (!time) {
    return
  }
  if (props.typeParser === 'number') {
    emit('update:value', time.getTime())
  }
  if (props.typeParser === 'string') {
    emit('update:value', time.toISOString())
  }
  if (props.typeParser === 'object') {
    emit('update:value', time)
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault() // Ngăn hành vi mặc định của phím Enter
    const time = getCurrentTime({ requireLength: false })
    if (!time) {
      return
    }
    if (props.typeParser === 'number') {
      emit('update:value', time.getTime())
      emit('selectTime', time.getTime())
    }
    if (props.typeParser === 'string') {
      emit('update:value', time.toISOString())
      emit('selectTime', time.toISOString())
    }
    if (props.typeParser === 'object') {
      emit('update:value', time)
      emit('selectTime', time)
    }
  }
}

const handleValueDatePicker = (value: number) => {
  emit('update:value', value)
  emit('selectTime', value)
  showDatePickerRanger.value = false
}

const getCurrentTime = (options: { requireLength: boolean }) => {
  if (
    !inputDate.value ||
    !inputMonth.value ||
    !inputYear.value ||
    !inputDate.value.innerHTML ||
    !inputMonth.value.innerHTML ||
    !inputYear.value.innerHTML
  ) {
    return undefined
  }

  if (options.requireLength) {
    if (
      inputDate.value.innerHTML.length < 2 ||
      inputMonth.value.innerHTML.length < 2 ||
      inputYear.value.innerHTML.length < 4
    ) {
      return undefined
    }
  }

  const time = new Date(1990, 10, 2, 0, 0, 0, 0)
  time.setFullYear(Number(inputYear.value.innerHTML))
  time.setMonth(Number(inputMonth.value.innerHTML) - 1)
  time.setDate(Number(inputDate.value.innerHTML))

  return time
}

const getCurrentYear = () => {
  if (!inputYear.value || !inputYear.value.innerHTML) {
    return undefined
  }
  return Number(inputYear.value.innerHTML)
}

const handleClickOutside = () => {
  showDatePickerRanger.value = false
}

const handleClickClear = () => {
  inputDate.value!.innerHTML = ''
  inputMonth.value!.innerHTML = ''
  inputYear.value!.innerHTML = ''
  emit('update:value', undefined)
  emit('selectTime', undefined)
}
</script>

<template>
  <Popover
    :custom-style="{
      arrow: true,
      offset: 10,
    }"
    :position="{ horizontal: 'start', vertical: 'bottom' }"
    :delayHide="1000"
  >
    <template #trigger>
      <div
        v-click-outside="handleClickOutside"
        :class="{ 'vue-input': true, 'disabled': disabled }"
      >
        <div class="icon-prepend" style="padding: 0 8px; cursor: pointer">
          <IconCalendar />
        </div>
        <div class="input-area">
          <div class="wrapper-date-time" @keydown="handleKeydown">
            <div
              ref="inputDate"
              class="input-item input-date"
              :contenteditable="!disabled"
              placeholder="DD"
              @input="(e) => handleInput(e, 'DATE')"
              @focus="handleFocus"
              @blur="(e) => handleBlur(e, 2)"
            ></div>
            <div style="opacity: 0.5">⧸</div>
            <div
              ref="inputMonth"
              class="input-item input-month"
              :contenteditable="!disabled"
              placeholder="MM"
              @input="(e) => handleInput(e, 'MONTH')"
              @focus="handleFocus"
              @blur="(e) => handleBlur(e, 2)"
            ></div>
            <div style="opacity: 0.5">⧸</div>
            <div
              ref="inputYear"
              class="input-item input-year"
              placeholder="YYYY"
              :contenteditable="!disabled"
              @input="(e) => handleInput(e, 'YEAR')"
              @focus="handleFocus"
              @blur="(e) => handleBlur(e, 4)"
            ></div>
          </div>
          <span style="opacity: 0.4">➔</span>
          <div class="wrapper-date-time" @keydown="handleKeydown">
            <div
              ref="inputDate"
              class="input-item input-date"
              :contenteditable="!disabled"
              placeholder="DD"
              @input="(e) => handleInput(e, 'DATE')"
              @focus="handleFocus"
              @blur="(e) => handleBlur(e, 2)"
            ></div>
            <div style="opacity: 0.5">⧸</div>
            <div
              ref="inputMonth"
              class="input-item input-month"
              :contenteditable="!disabled"
              placeholder="MM"
              @input="(e) => handleInput(e, 'MONTH')"
              @focus="handleFocus"
              @blur="(e) => handleBlur(e, 2)"
            ></div>
            <div style="opacity: 0.5">⧸</div>
            <div
              ref="inputYear"
              class="input-item input-year"
              placeholder="YYYY"
              :contenteditable="!disabled"
              @input="(e) => handleInput(e, 'YEAR')"
              @focus="handleFocus"
              @blur="(e) => handleBlur(e, 4)"
            ></div>
          </div>
        </div>
        <div class="icon-append" @click="handleClickClear">
          <div v-if="!disabled" class="icon-clear-blur">
            <IconClose />
          </div>
          <div v-if="!disabled" class="icon-clear-hover">
            <IconCloseCircle />
          </div>
        </div>
        <div v-if="!disabled" class="date-picker-ranger">
          <!-- <DatePickerRanger
        :value="new Date(value || '2024-01-02').getTime()"
        @update:value="handleValueDatePicker"
      /> -->
        </div>
      </div>
    </template>
    <template #content>
      <DatePickerRanger
        :value="new Date(value || '2024-01-02').getTime()"
        @update:value="handleValueDatePicker"
      />
    </template>
  </Popover>
</template>

<style lang="scss" scoped>
.wrapper-date-time {
  padding: 4px 6px;
  display: flex;
  .input-item {
    outline: none;
    padding: 0 6px;
    white-space: nowrap;
    font-size: 16px;
    font-family: monospace;
    color: #333;
  }
  .input-date {
    width: 2em;
    cursor: text;
  }
  .input-month {
    width: 2em;
    cursor: text;
  }
  .input-year {
    width: 3em;
    cursor: text;
  }
}

.date-picker-ranger {
  position: absolute;
  top: 100%;
  min-width: 600px;
  left: 0;
  width: 100%;
  z-index: 1000;
}
</style>
