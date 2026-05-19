<script setup lang="ts">
import { computed } from 'vue'
import { IconDoubleLeft, IconDoubleRight, IconLeft, IconRight } from './icon-antd'

const props = withDefaults(
  defineProps<{
    total: number
    page?: number
    limit?: number
    delta?: number
  }>(),
  {
    page: 1,
    limit: 10,
    delta: 1,
  },
)

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

const calculatorPagination = (current: number, length: number, delta = 2) => {
  if (!length) length = 1
  const array: (string | number)[] = []

  const positionA = 1 + 1 + delta + 1
  const positionB = length - 1 - delta - 1

  for (let i = 1; i <= length; i++) {
    if (
      i == 1 ||
      i == length ||
      (current - delta <= i && i <= current + delta) ||
      (current <= positionA && i <= positionA + delta) ||
      (current >= positionB && i >= positionB - delta)
    ) {
      array.push(i)
    }
  }
  if (current > positionA) array.splice(1, 0, '<<<')
  if (current < positionB) array.splice(-1, 0, '>>>')
  return array
}

const pageCount = computed(() => Math.ceil(props.total / props.limit))

const textList = computed(() => {
  return calculatorPagination(props.page, pageCount.value, props.delta)
})

const clickChangePage = (pageClick: number) => {
  let pageSend = pageClick
  if (pageSend > pageCount.value) pageSend = pageCount.value
  if (pageSend < 1) pageSend = 1
  emit('update:page', pageSend)
}
</script>

<template>
  <div class="vue-pagination">
    <button
      class="pagination-item pagination-item-link"
      :class="page <= 1 ? 'pagination-item-disabled' : ''"
      @click="clickChangePage(page - 10)"
      :disabled="page <= 1"
    >
      <IconLeft />
    </button>
    <template v-for="(text, i) in textList" :key="i">
      <div
        v-if="text === '<<<'"
        class="pagination-item pagination-item-jump"
        @click="clickChangePage(page - 5)"
      >
        <span class="pagination-item-ellipsis">•••</span>
        <span class="pagination-item-hover">
          <IconDoubleLeft />
        </span>
      </div>
      <div
        v-if="typeof text === 'number'"
        class="pagination-item pagination-item-number"
        :class="`${text === page ? 'pagination-item-active' : ''}`"
        @click="(e) => clickChangePage(text)"
      >
        {{ text }}
      </div>
      <div
        v-if="text === '>>>'"
        class="pagination-item pagination-item-jump"
        @click="clickChangePage(page + 5)"
      >
        <span class="pagination-item-ellipsis">•••</span>
        <span class="pagination-item-hover">
          <IconDoubleRight />
        </span>
      </div>
    </template>
    <button
      class="pagination-item pagination-item-link"
      :class="page >= pageCount ? 'pagination-item-disabled' : ''"
      @click="clickChangePage(page + 10)"
      :disabled="page >= pageCount"
    >
      <IconRight />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.vue-pagination {
  display: flex;
  gap: 8px;
  .pagination-item {
    padding: 5px 10px 5px 10px;
    text-align: center;
    background-color: #fff;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    &.pagination-item-number {
      border: 1px solid #d9d9d9;
      border-radius: 2px;
    }
    &.pagination-item-disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
    &:hover {
      font-weight: 500;
      color: #1890ff;
      border-color: #1890ff;
    }
    &.pagination-item-active {
      font-weight: 700;
      color: #1890ff;
      border-color: #1890ff;
    }
    &.pagination-item-link {
      border: 1px solid #d9d9d9;
      border-radius: 2px;
      font-size: 0.9em;
    }

    &.pagination-item-jump {
      border: none;
      .pagination-item-ellipsis {
        display: inline;
      }
      .pagination-item-hover {
        display: none;
      }
      &:hover {
        .pagination-item-ellipsis {
          display: none;
        }
        .pagination-item-hover {
          display: inline;
        }
      }
    }
  }
}
</style>
