<script setup lang="ts">
import { onMounted } from 'vue'
import { ref, watch, watchEffect } from 'vue'
import { ESNumber } from '../../utils'
import { IconSortDown, IconSortUp } from '../icon-font-awesome'

const props = withDefaults(
  defineProps<{
    value: number | string
    prepend?: string
    append?: string
    textAlign?: 'left' | 'right' | 'center'
    disabled?: boolean
    placeholder?: string
    required?: boolean
    controlHorizontal?: boolean
    controlVertical?: boolean
    controlPlusDisable?: boolean
    controlMinusDisable?: boolean
    step?: number
    validate?: {
      'gt'?: number
      'GT'?: number
      '>'?: number
      'gte'?: number
      'GTE'?: number
      '>='?: number
      'lt'?: number
      'LT'?: number
      '<'?: number
      'lte'?: number
      'LTE'?: number
      '<='?: number
    }
  }>(),
  {
    value: 0,
    prepend: '',
    append: '',
    textAlign: 'left',
    disabled: false,
    placeholder: '',
    required: false,
    validate: () => ({}),
    controlHorizontal: false,
    controlVertical: false,
    controlPlusDisable: false,
    controlMinusDisable: false,
    step: 1,
  },
)
const emit = defineEmits<{ (e: 'update:value', value: number): void }>()

const inputNumber = ref<HTMLInputElement | null>(null)

watchEffect(() => {
  if (inputNumber.value && props.validate && props.value != null) {
    let msg = ''
    ;['GT', 'gt', '>'].forEach((rule) => {
      const propsValid = props.validate[rule as keyof typeof props.validate]
      if (propsValid != null && !(Number(props.value) > propsValid)) {
        msg = `Giá trị phải lớn hơn ${ESNumber.format({ number: propsValid })}`
      }
    })
    ;['GTE', 'gte', '>='].forEach((rule) => {
      const propsValid = props.validate[rule as keyof typeof props.validate]
      if (propsValid != null && !(Number(props.value) >= propsValid)) {
        msg = `Giá trị phải lớn hơn hoặc bằng ${ESNumber.format({ number: propsValid })}`
      }
    })
    ;['LT', 'lt', '<'].forEach((rule) => {
      const propsValid = props.validate[rule as keyof typeof props.validate]
      if (propsValid != null && !(Number(props.value) < propsValid)) {
        msg = `Giá trị phải nhỏ hơn hoặc bằng ${ESNumber.format({ number: propsValid })}`
      }
    })
    ;['LTE', 'lte', '<='].forEach((rule) => {
      const propsValid = props.validate[rule as keyof typeof props.validate]
      if (propsValid != null && !(Number(props.value) <= propsValid)) {
        msg = `Giá trị phải nhỏ hơn hoặc bằng ${ESNumber.format({ number: propsValid })}`
      }
    })
    return inputNumber.value.setCustomValidity(msg)
  }
})

onMounted(() => {
  watch(
    () => props.value,
    (newValue, oldValue) => {
      const currentValue = Number(inputNumber.value!.value.replace(/,/g, ''))
      if (currentValue !== newValue) {
        inputNumber.value!.value = newValue
          .toString()
          .split('.') // convert cho những số trước dấu '.'
          .map((i, index) => (index === 0 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : i))
          .join('.')
      }
    },
    { immediate: true },
  )
})

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const selectionStart = target.selectionStart || 0
  const inputType = (e as InputEvent).inputType

  const beforeValue = target.value
  const afterValue = beforeValue
    .replace(/[^\d.-]/g, '') // Loại bỏ ký tự không phải số và dấu - và .
    .replace(/(?!^)-/g, '') // Loại bỏ tất cả dấu '-' không ở vị trí đầu tiên
    .replace(/(\..*?)\./g, '$1') // Loại bỏ tất cả các dấu '.' không phải là dấu '.' đầu tiên
    .split('.') // convert cho những số trước dấu '.'
    .map((i, index) => (index === 0 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : i))
    .join('.')

  target.value = afterValue

  if (inputType.startsWith('insert') || inputType.startsWith('delete')) {
    const newSelectionStart = selectionStart + (afterValue.length - beforeValue.length)
    target.selectionStart = newSelectionStart
    target.selectionEnd = newSelectionStart
  }

  const number = Number(afterValue.replace(/,/g, '')) || 0
  emit('update:value', number)
}

const clickDown = () => {
  emit('update:value', Number(props.value) - props.step)
}

const clickUp = () => {
  emit('update:value', Number(props.value) + props.step)
}

const handleFocus = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.value) {
    target.select()
  }
}

const focus = () => {
  inputNumber.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div
    :class="{
      'vue-input': true,
      'disabled': disabled,
      'vue-button-vertical': !!controlVertical,
    }"
  >
    <div v-if="prepend" class="prepend">
      {{ prepend }}
    </div>
    <button
      type="button"
      v-if="controlHorizontal"
      :disabled="controlMinusDisable"
      class="button-control-horizontal button-minus"
      @click.prevent="clickDown"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19,13H5V11H19V13Z"></path>
      </svg>
    </button>
    <button
      type="button"
      v-if="controlVertical"
      :disabled="controlPlusDisable"
      class="button-control-vertical button-up"
      @click.prevent="clickUp"
    >
      <IconSortUp style="opacity: 0.6" />
    </button>
    <div class="input-area">
      <input
        ref="inputNumber"
        :style="{ textAlign }"
        :placeholder="placeholder || '0'"
        :disabled="disabled"
        :required="required"
        inputmode="decimal"
        @focus="handleFocus"
        @input="handleInput"
      />
    </div>
    <button
      type="button"
      v-if="controlHorizontal"
      :disabled="controlPlusDisable"
      class="button-control-horizontal button-plus"
      @click.prevent="clickUp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"></path>
      </svg>
    </button>
    <button
      type="button"
      v-if="controlVertical"
      :disabled="controlMinusDisable"
      class="button-control-vertical button-down"
      @click.prevent="clickDown"
    >
      <IconSortDown style="opacity: 0.6" />
    </button>
    <div v-if="append" class="append">
      {{ append }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vue-button-vertical {
  flex-direction: column;
  border: none !important;
  &:focus-within {
    border: none !important;
    box-shadow: none;
  }

  &:not(.disabled):hover {
    border: none !important;
  }
  .button-control-vertical {
    width: 100%;
    height: 2em;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    & > svg {
      width: 1.6em;
      height: 1.6em;
    }
    &:active {
      & > svg {
        width: 1.8em;
        height: 1.8em;
      }
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  input {
    text-align: center !important;
  }
}
input {
  padding-right: 12px !important;
}

.button-control-horizontal {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 2em;
  & > svg {
    width: 1.2em;
    height: 1.2em;
  }
  &:active {
    border-left: 1px solid #40a9ff;
    & > svg {
      width: 1.4em;
      height: 1.4em;
    }
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.button-up {
  // border-bottom: 1px solid #cdcdcd;
  & > svg {
    transform: translateY(25%);
  }
}
.button-down {
  // border-top: 1px solid #cdcdcd;
  & > svg {
    transform: translateY(-25%);
  }
}
.button-minus {
  border-right: 1px solid #cdcdcd;
}
.button-plus {
  border-left: 1px solid #cdcdcd;
}
</style>
