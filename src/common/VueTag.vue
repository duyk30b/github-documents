<script setup lang="ts">
import {
  IconCalendar,
  IconCheckCircle,
  IconClockCircle,
  IconCloseCircle,
  IconDollar,
  IconExclamationCircle,
  IconForm,
  IconMinusCircle,
  IconRollback,
  IconSend,
  IconSpin,
  IconStop,
} from './icon-antd'

const props = withDefaults(
  defineProps<{
    color?: 'default' | 'green' | 'blue' | 'cyan' | 'orange' | 'red' | 'purple'
    bgColor?: string
    size?: 'small' | 'default' | 'large' | 'text'
    icon?:
      | Object
      | ''
      | 'calendar'
      | 'close'
      | 'check'
      | 'clock'
      | 'dollar'
      | 'exclamation'
      | 'form'
      | 'minus'
      | 'rollback'
      | 'send'
      | 'spin'
      | 'stop'
  }>(),
  {
    color: 'default',
    bgColor: '',
    size: 'default',
    icon: '',
  },
)
</script>

<template>
  <div
    :class="`vue-tag vue-tag-${color} vue-tag-size-${size}`"
    :style="bgColor ? `background-color: ${bgColor}; color: white` : ''"
  >
    <div>
      <span v-if="typeof icon === 'object'">
        <component :is="icon" />
      </span>
      <span v-else-if="icon === 'close'" class="icon-close"><IconCloseCircle /></span>
      <span v-else-if="icon === 'calendar'" class="icon-calendar"><IconCalendar /></span>
      <span v-else-if="icon === 'check'" class="icon-check"><IconCheckCircle /></span>
      <span v-else-if="icon === 'clock'" class="icon-clock"><IconClockCircle /></span>
      <span v-else-if="icon === 'dollar'" class="icon-dollar"><IconDollar /></span>
      <span v-else-if="icon === 'exclamation'" class="icon-exclamation">
        <IconExclamationCircle />
      </span>
      <span v-else-if="icon === 'form'" class="icon-form"><IconForm /></span>
      <span v-else-if="icon === 'minus'" class="icon-minus"><IconMinusCircle /></span>
      <span v-else-if="icon === 'send'" class="icon-send"><IconSend /></span>
      <span v-else-if="icon === 'rollback'" class="icon-rollback"><IconRollback /></span>
      <span v-else-if="icon === 'stop'" class="icon-stop"><IconStop /></span>
      <span v-else-if="icon === 'spin'" class="icon-stop"><IconSpin /></span>
      <slot v-else name="icon"></slot>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vue-tag {
  position: relative;
  display: inline-block;
  padding: 0 6px;
  outline: 0;
  white-space: nowrap;
  border: 1px solid #cdcdcd;
  border-radius: 2px;
  background-color: white;
  line-height: 22px;

  div {
    display: flex;
    gap: 0.5em; // để những icon bên trong được cách xa ra 1 chút
    justify-content: center;
    align-items: center;
    font-size: 12px;
    span {
      line-height: 0;
      &.icon-check {
        svg {
          // shape-rendering: optimizespeed; // bật thì đậm hơn
        }
      }
      &.icon-minus {
        svg {
          // shape-rendering: optimizespeed; // tắt thì đậm hơn, thế mới hay
        }
      }
      &.icon-print {
        svg {
          // shape-rendering: optimizespeed; // bật màu sáng hơn nhưng thanh mảnh hơn
        }
      }
      &.icon-save {
        svg {
          // shape-rendering: optimizespeed; // bật màu sáng hơn nhưng thanh mảnh hơn
        }
      }
      &.icon-trash {
        svg {
          // shape-rendering: optimizespeed; // thanh mảnh trông rất xấu
        }
      }
    }
  }

  &.vue-tag-green {
    color: #52c41a;
    background-color: #f6ffed;
    border-color: #b7eb8f;
  }

  &.vue-tag-blue {
    color: #1890ff;
    background-color: #e6f7ff;
    border-color: #91d5ff;
  }

  &.vue-tag-cyan {
    color: #08979c;
    background-color: #e6fffb;
    border-color: #87e8de;
  }

  &.vue-tag-orange {
    color: #faad14;
    background-color: #fffbe6;
    border-color: #ffe58f;
  }

  &.vue-tag-red {
    color: #ff4d4f;
    background-color: #fff1f0;
    border-color: #ffa39e;
  }

  &.vue-tag-purple {
    color: #531dab;
    background-color: #f9f0ff;
    border-color: #d3adf7;
  }

  &.vue-tag-size-text {
    padding: 0 8px;
    border: none;
    color: #1890ff;
    background-color: inherit !important;

    &.vue-tag-blue {
      color: #1890ff;
      &:hover {
        color: #40a9ff;
      }
    }
  }

  &.vue-tag-size-small {
    font-size: 13px;
    padding: 0 12px;
  }

  &.vue-tag-size-large {
    padding: 8px 24px;
    font-size: 16px;
  }
}
</style>
