<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ESTimer } from '../../utils'

const props = withDefaults(
  defineProps<{
    value?: number
    defaultType?: 'date' | 'month' | 'year'
  }>(),
  {
    value: () => Date.now(),
    defaultType: 'year',
  },
)
const emit = defineEmits<{ (e: 'update:value', value: number): void }>()

const currentTime = ref<number>(Date.now())
const startOfMonth = ref<number>(Date.now())
const endOfMonth = ref<number>(Date.now())

const dateList = ref<Date[]>([])

const type = ref<'date' | 'month' | 'year'>(props.defaultType)

const startOfDateValue = computed(() => {
  return ESTimer.startOfDate(currentTime.value).getTime()
})
const currentFullYear = computed(() => {
  return new Date(currentTime.value).getFullYear()
})
const currentMonth = computed(() => {
  return new Date(currentTime.value).getMonth()
})
const yearList = computed(() => {
  const firstYear = Math.floor(currentFullYear.value / 25) * 25
  return Array.from({ length: 25 }, (_, i) => {
    return firstYear + 1 + i
  })
})

watch(
  () => props.value,
  (newValue) => (currentTime.value = newValue),
  { immediate: true },
)
watch(
  () => currentTime.value,
  (newCurrentDate) => {
    startOfMonth.value = ESTimer.startOfMonth(newCurrentDate).getTime()
    endOfMonth.value = ESTimer.endOfMonth(newCurrentDate).getTime()

    const temp = startOfMonth.value - 7 * 24 * 60 * 60 * 1000
    let firstDate = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(temp + i * 24 * 60 * 60 * 1000)
      if (date.getDay() === 0) {
        firstDate = date
      }
    }

    dateList.value = Array.from({ length: 42 }, (_, i) => {
      return new Date(firstDate.getTime() + i * 24 * 60 * 60 * 1000)
    })
  },
  { immediate: true },
)

const clickIncreaseYear = (number: number) => {
  const currentDate = new Date(currentTime.value)
  currentDate.setFullYear(currentDate.getFullYear() + number)
  currentTime.value = currentDate.getTime()
}

const clickIncreaseMonth = (number: number) => {
  const currentDate = new Date(currentTime.value)
  currentDate.setMonth(currentDate.getMonth() + number)
  currentTime.value = currentDate.getTime()
}

const selectYear = (year: number) => {
  const time = new Date(currentTime.value)
  time.setFullYear(year)
  currentTime.value = time.getTime()
  type.value = 'month'
}

const selectMonth = (month: number) => {
  const time = new Date(currentTime.value)
  time.setMonth(month)
  currentTime.value = time.getTime()
  type.value = 'date'
}
const selectDate = (time: number) => {
  currentTime.value = time
  emit('update:value', time)
}
</script>

<template>
  <div class="date-picker-ranger-container">
    <div class="date-picker-container">
      <template v-if="type === 'date'">
        <div class="date-picker-title">
          <button class="pick-arrow" @click="clickIncreaseYear(-1)">«</button>
          <button class="pick-arrow" @click="clickIncreaseMonth(-1)">‹</button>
          <div class="pick-month-year">
            <button @click.stop="type = 'month'" class="pick-month">
              {{ (new Date(currentTime).getMonth() + 1).toString().padStart(2, '0') }}
            </button>
            <div>/</div>
            <button @click.stop="type = 'year'" class="pick-year">
              {{ new Date(currentTime).getFullYear() }}
            </button>
          </div>
          <button class="pick-arrow" @click="clickIncreaseMonth(1)">›</button>
          <button class="pick-arrow" @click="clickIncreaseYear(1)">»</button>
        </div>
        <div class="date-picker-header">
          <div class="item-day"><div>CN</div></div>
          <div class="item-day"><div>T2</div></div>
          <div class="item-day"><div>T3</div></div>
          <div class="item-day"><div>T4</div></div>
          <div class="item-day"><div>T5</div></div>
          <div class="item-day"><div>T6</div></div>
          <div class="item-day"><div>T7</div></div>
        </div>
        <div class="date-picker-content grid-date">
          <div
            v-for="(date, index) in dateList"
            :key="index"
            class="grid-item item-date"
            @click="selectDate(date.getTime())"
          >
            <button
              :class="{
                'grid-item-inner': true,
                'active': date.getTime() === startOfDateValue,
                'outside': date.getTime() < startOfMonth || date.getTime() > endOfMonth,
              }"
            >
              {{ date.getDate() }}
            </button>
          </div>
        </div>
      </template>
      <template v-if="type === 'year'">
        <div class="date-picker-title">
          <button class="pick-arrow" @click="clickIncreaseYear(-25)">«</button>
          <button class="pick-month-year" @click.stop="type = 'month'">
            {{ yearList[0] }} -
            {{ yearList[yearList.length - 1] }}
          </button>
          <button class="pick-arrow" @click="clickIncreaseYear(25)">»</button>
        </div>
        <div class="date-picker-content grid-year">
          <div
            v-for="(year, index) in yearList"
            :key="index"
            class="grid-item item-year"
            @click.stop="selectYear(year)"
          >
            <button
              :class="{
                'grid-item-inner': true,
                'active': year === currentFullYear,
              }"
            >
              {{ year }}
            </button>
          </div>
        </div>
      </template>
      <template v-if="type === 'month'">
        <div class="date-picker-title">
          <button class="pick-arrow" @click="clickIncreaseYear(-10)">«</button>
          <button class="pick-arrow" @click="clickIncreaseYear(-1)">‹</button>
          <button class="pick-month-year" @click.stop="type = 'date'">
            {{ new Date(currentTime).getFullYear() }}
          </button>
          <button class="pick-arrow" @click="clickIncreaseYear(1)">›</button>
          <button class="pick-arrow" @click="clickIncreaseYear(10)">»</button>
        </div>
        <div class="date-picker-content grid-month">
          <div
            v-for="(month, index) in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]"
            :key="index"
            class="grid-item item-month"
            @click.stop="selectMonth(month)"
          >
            <button
              :class="{
                'grid-item-inner': true,
                'active': month === currentMonth,
              }"
            >
              {{ (month + 1).toString().padStart(2, '0') }}
            </button>
          </div>
        </div>
      </template>
      <div class="date-picker-footer">
        <button @click="selectDate(Date.now())">Hôm nay</button>
      </div>
    </div>
    <div class="date-picker-container">
      <template v-if="type === 'date'">
        <div class="date-picker-title">
          <button class="pick-arrow" @click="clickIncreaseYear(-1)">«</button>
          <button class="pick-arrow" @click="clickIncreaseMonth(-1)">‹</button>
          <div class="pick-month-year">
            <button @click.stop="type = 'month'" class="pick-month">
              {{ (new Date(currentTime).getMonth() + 1).toString().padStart(2, '0') }}
            </button>
            <div>/</div>
            <button @click.stop="type = 'year'" class="pick-year">
              {{ new Date(currentTime).getFullYear() }}
            </button>
          </div>
          <button class="pick-arrow" @click="clickIncreaseMonth(1)">›</button>
          <button class="pick-arrow" @click="clickIncreaseYear(1)">»</button>
        </div>
        <div class="date-picker-header">
          <div class="item-day"><div>CN</div></div>
          <div class="item-day"><div>T2</div></div>
          <div class="item-day"><div>T3</div></div>
          <div class="item-day"><div>T4</div></div>
          <div class="item-day"><div>T5</div></div>
          <div class="item-day"><div>T6</div></div>
          <div class="item-day"><div>T7</div></div>
        </div>
        <div class="date-picker-content grid-date">
          <div
            v-for="(date, index) in dateList"
            :key="index"
            class="grid-item item-date"
            @click="selectDate(date.getTime())"
          >
            <button
              :class="{
                'grid-item-inner': true,
                'active': date.getTime() === startOfDateValue,
                'outside': date.getTime() < startOfMonth || date.getTime() > endOfMonth,
              }"
            >
              {{ date.getDate() }}
            </button>
          </div>
        </div>
      </template>
      <template v-if="type === 'year'">
        <div class="date-picker-title">
          <button class="pick-arrow" @click="clickIncreaseYear(-25)">«</button>
          <button class="pick-month-year" @click.stop="type = 'month'">
            {{ yearList[0] }} -
            {{ yearList[yearList.length - 1] }}
          </button>
          <button class="pick-arrow" @click="clickIncreaseYear(25)">»</button>
        </div>
        <div class="date-picker-content grid-year">
          <div
            v-for="(year, index) in yearList"
            :key="index"
            class="grid-item item-year"
            @click.stop="selectYear(year)"
          >
            <button
              :class="{
                'grid-item-inner': true,
                'active': year === currentFullYear,
              }"
            >
              {{ year }}
            </button>
          </div>
        </div>
      </template>
      <template v-if="type === 'month'">
        <div class="date-picker-title">
          <button class="pick-arrow" @click="clickIncreaseYear(-10)">«</button>
          <button class="pick-arrow" @click="clickIncreaseYear(-1)">‹</button>
          <button class="pick-month-year" @click.stop="type = 'date'">
            {{ new Date(currentTime).getFullYear() }}
          </button>
          <button class="pick-arrow" @click="clickIncreaseYear(1)">›</button>
          <button class="pick-arrow" @click="clickIncreaseYear(10)">»</button>
        </div>
        <div class="date-picker-content grid-month">
          <div
            v-for="(month, index) in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]"
            :key="index"
            class="grid-item item-month"
            @click.stop="selectMonth(month)"
          >
            <button
              :class="{
                'grid-item-inner': true,
                'active': month === currentMonth,
              }"
            >
              {{ (month + 1).toString().padStart(2, '0') }}
            </button>
          </div>
        </div>
      </template>
      <div class="date-picker-footer">
        <button @click="selectDate(Date.now())">Hôm nay</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.date-picker-ranger-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  background-color: white;
  box-shadow:
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
}
.date-picker-container {
  border: 1px solid inherit;
  flex: 1;
  .date-picker-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
    padding: 6px;
    background-color: #5884c4;
    color: #fff;
    font-weight: bold;

    button {
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
      border: 1px solid #5884c4;
      border-radius: 4px;
      transition: all 0.2s;
      &:hover {
        background-color: #4d8ff3;
        border-color: #c0d4f3;
      }
      &:active {
        background-color: #1c52a1;
        border-color: #c0d4f3;
      }
    }

    .pick-month-year {
      flex: 2;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
      gap: 4px;
    }
    .pick-month,
    .pick-year {
      padding: 0 6px;
    }
    .pick-arrow {
      padding: 0 1em;
    }
  }
  .date-picker-header {
    padding: 0 4px;
    background-color: #f0f0f0;
    border-bottom: 1px solid #aeaeae;
    display: flex;
    justify-content: space-around;
    align-items: center;
    .item-day {
      padding: 6px 4px;
    }
  }
  .date-picker-content {
    background-color: #fff;
    padding: 0 4px 4px 4px;
    .grid-item {
      display: flex;
      .grid-item-inner {
        cursor: pointer;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        user-select: none;
        // transition: all 0.1s;
        border: 1px solid #fff;
        border-radius: 4px;
        &:hover {
          background-color: #f2f2f2;
          border-color: #c0d4f3;
        }
        &:active {
          background-color: #1c52a1;
          border-color: #c0d4f3;
          color: white;
        }
        &.outside {
          opacity: 0.3;
        }
        &.active {
          background-color: #5884c4;
          color: #fff;
        }
      }
    }
    &.grid-date {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr;
      .item-date {
        padding: 4px;
        .grid-item-inner {
          padding: 4px 4px;
        }
      }
    }
    &.grid-year {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(5, 1fr);
      .item-year {
        padding: 4px;
        .grid-item-inner {
          padding: 6px 4px;
        }
      }
    }
    &.grid-month {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(4, 1fr);
      .item-month {
        padding: 4px;
        .grid-item-inner {
          padding: 6px 4px;
        }
      }
    }
  }
  .date-picker-footer {
    display: flex;
    justify-content: flex-end;
    background-color: #fff;
    border-top: 1px solid #eee;
    padding: 4px 8px;
    button {
      color: #1890ff;
      padding: 0 8px;
      border: 1px solid transparent;
      border-radius: 2px;
      cursor: pointer;
      &:hover {
        border-color: #1890ff;
        opacity: 0.8;
      }
    }
  }
}
</style>
