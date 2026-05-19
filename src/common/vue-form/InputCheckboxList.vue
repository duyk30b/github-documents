<script setup lang="ts">
import { computed, ref, type StyleValue, watchEffect } from 'vue'

export type CheckboxOptionType = {
  key: string | number
  label: string
  disabled?: boolean
  children?: CheckboxOptionType[]
}

export type CheckboxAllPropType = {
  label?: string
  style?: StyleValue
}

const props = withDefaults(
  defineProps<{
    value: Record<string, boolean | any>
    options: CheckboxOptionType[]
    checkboxAll?: boolean
    customStyle?: {
      checkboxAllLabel?: string
      checkboxAllWrap?: StyleValue
      checkboxItemWrap?: StyleValue
      checkboxItem?: StyleValue
    }
  }>(),
  {
    value: () => ({}),
    options: () => [],
    checkboxAll: true,
    customStyle: () => ({}),
  },
)

const emit = defineEmits<{
  (e: 'update:value', value: Record<string, boolean | any>): void
}>()

const randomId = computed(() => Math.random().toString(36).substring(2))
let valueStringify = ''
let optionsStringify = ''
const checkMap = ref<Record<string, boolean | any>>({})
const checkedAll = ref<boolean>(false)
const indeterminate = ref<boolean>(false)

const reloadIndeterminateCheckbox = () => {
  const hasCheckedAll = props.options.every((i) => {
    return checkMap.value[i.key]
  })
  const noCheckedAll = props.options.every((i) => {
    return !checkMap.value[i.key]
  })

  if (hasCheckedAll) {
    checkedAll.value = true
    indeterminate.value = false
  } else if (noCheckedAll) {
    checkedAll.value = false
    indeterminate.value = false
  } else {
    checkedAll.value = false
    indeterminate.value = true
  }
}

watchEffect(() => {
  const newValueStringify = JSON.stringify(props.value)
  const newOptionsStringify = JSON.stringify(props.options)

  if (valueStringify === newValueStringify && optionsStringify === newOptionsStringify) {
    return
  }
  valueStringify = newValueStringify
  optionsStringify = newOptionsStringify

  props.options.forEach((option) => {
    checkMap.value[option.key] = props.value[option.key]
  })
  reloadIndeterminateCheckbox()
})

const handleChangeCheckboxItem = (e: Event, key: string | number) => {
  checkMap.value[key] = (e.target as HTMLInputElement).checked
  emit('update:value', JSON.parse(JSON.stringify(checkMap.value)))
}

const handleChangeCheckboxParent = (e: Event) => {
  checkedAll.value = (e.target as HTMLInputElement).checked
  indeterminate.value = false
  const v: Record<string, boolean | any> = {}
  props.options.forEach((i) => (v[i.key] = checkedAll.value))
  emit('update:value', v)
}

defineExpose({ focus })
</script>

<template>
  <div
    v-show="checkboxAll"
    :style="
      customStyle?.checkboxAllWrap ||
      'margin-bottom: 12px; display: flex; gap: 0.5em; flex-wrap: wrap; align-items: center'
    "
  >
    <input
      :id="randomId + 'PARENT'"
      style="cursor: pointer"
      :checked="checkedAll"
      :indeterminate="indeterminate"
      type="checkbox"
      :name="randomId + 'PARENT'"
      @change="(e) => handleChangeCheckboxParent(e)"
    />
    <label style="cursor: pointer; user-select: none" :for="randomId + 'PARENT'">
      {{ customStyle?.checkboxAllLabel || 'Tất cả' }}
    </label>
  </div>
  <div :style="customStyle?.checkboxItemWrap || 'display: flex; gap: 12px; flex-wrap: wrap; align-items: center'">
    <div
      v-for="(option, index) in options"
      :key="index"
      :style="
        customStyle?.checkboxItem || 'display: flex; gap: 0.5em; align-items: center; flex-basis: 300px; flex-grow: 1'
      "
    >
      <input
        :id="randomId + '_' + index"
        style="cursor: pointer"
        :checked="checkMap[option.key]"
        type="checkbox"
        :name="randomId + '_' + index"
        @change="(e) => handleChangeCheckboxItem(e, option.key)"
      />
      <label style="cursor: pointer; user-select: none" :for="randomId + '_' + index">
        {{ option.label }}
      </label>
    </div>
  </div>
</template>
