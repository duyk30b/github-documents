<script setup lang="ts">
import {
  IconClose,
  IconDelete,
  IconDollar,
  IconDownload,
  IconPlus,
  IconPrint,
  IconSave,
  IconSend,
  IconUpload,
} from './icon-antd'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    disabled?: boolean
    color?: 'default' | 'green' | 'blue' | 'red' | 'cyan' | 'purple'
    size?: 'small' | 'default' | 'large' | 'text'
    type?: 'reset' | 'submit' | 'button'
    icon?: Object | '' | 'save' | 'print' | 'plus' | 'close' | 'trash' | 'dollar' | 'send' | 'upload' | 'download'
  }>(),
  {
    loading: false,
    disabled: false,
    color: 'default',
    size: 'default',
    type: 'button',
    icon: '',
  },
)
</script>

<template>
  <button
    :disabled="disabled || loading"
    :type="type"
    :class="`btn btn-${color} btn-size-${size} ${loading ? 'btn-loading' : ''}`"
  >
    <span v-if="loading">
      <svg class="icon-spin" width="1em" height="1em" fill="currentColor" aria-hidden="true" viewBox="0 0 1024 1024">
        <path
          d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"
        ></path>
      </svg>
    </span>
    <span v-else-if="typeof icon === 'object'">
      <component :is="icon" />
    </span>
    <span v-else-if="icon === 'close'" class="icon-close"><IconClose /></span>
    <span v-else-if="icon === 'save'" class="icon-save"><IconSave /></span>
    <span v-else-if="icon === 'print'" class="icon-print"><IconPrint /></span>
    <span v-else-if="icon === 'plus'" class="icon-plus"><IconPlus /></span>
    <span v-else-if="icon === 'trash'" class="icon-trash"><IconDelete /></span>
    <span v-else-if="icon === 'dollar'" class="icon-dollar"><IconDollar /></span>
    <span v-else-if="icon === 'send'" class="icon-send"><IconSend /></span>
    <span v-else-if="icon === 'upload'" class="icon-upload"><IconUpload /></span>
    <span v-else-if="icon === 'download'" class="icon-download"><IconDownload /></span>
    <slot v-else name="icon"></slot>
    <slot></slot>
  </button>
</template>

<style lang="scss">
.btn {
  position: relative;
  padding: 4px 16px;
  cursor: pointer;
  outline: 0;
  border-radius: 8px;
  white-space: nowrap;
  transition:
    background-color 0.2s,
    border-color 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 0.5rem; // để những icon bên trong được cách xa ra 1 chút
  justify-content: center;
  border: 1px solid var(--c-border);
  background-color: var(--c-surface-1);
  color: var(--c-text);
  line-height: 24px;

  svg {
    line-height: 0;
  }

  span {
    display: flex;
    align-items: center;
    &.icon-plus {
      svg {
        shape-rendering: optimizespeed; // bật thì đậm hơn
      }
    }
    &.icon-close {
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
        shape-rendering: optimizespeed; // bật màu sáng hơn nhưng thanh mảnh hơn
      }
    }
    &.icon-trash {
      svg {
        // shape-rendering: optimizespeed; // thanh mảnh trông rất xấu
      }
    }
  }

  &:focus {
    border-color: var(--c-primary);
    color: var(--c-primary);
  }

  &:hover {
    border-color: var(--c-primary);
    color: var(--c-primary);
  }

  &:disabled {
    cursor: not-allowed;
    background-color: var(--c-surface-2) !important;
    color: var(--c-text-soft) !important;
    border: 1px solid var(--c-border) !important;
    opacity: 0.92;
  }

  &.btn-size-text {
    padding: 0 8px;
    border: none;
    color: var(--c-primary);
    background-color: inherit !important;
    &:hover {
      color: var(--c-primary);
    }
    &.btn-blue {
      color: var(--c-primary);
      &:hover {
        color: var(--c-primary);
      }
    }
  }

  &.btn-size-small {
    font-size: 13px;
    padding: 0 8px;
  }

  &.btn-size-large {
    padding: 8px 24px;
    font-size: 16px;
  }

  &.btn-blue {
    background-color: var(--c-primary);
    border-color: var(--c-primary);
    color: white;

    &:hover {
      background-color: color-mix(in srgb, var(--c-primary) 88%, #ffffff 12%);
      border-color: color-mix(in srgb, var(--c-primary) 84%, #000000 16%);
    }

    &:focus {
      background-color: var(--c-primary);
      border-color: var(--c-primary);
    }

    &:active {
      background-color: color-mix(in srgb, var(--c-primary) 78%, #000000 22%);
      border-color: color-mix(in srgb, var(--c-primary) 78%, #000000 22%);
    }

    &.btn-loading {
      &:disabled {
        background-color: var(--c-primary) !important;
        color: white !important;
      }
    }
  }

  &.btn-green {
    background-color: #6da34d;
    border-color: #6da34d;
    color: white;

    &:hover {
      background-color: #27ae60;
      border-color: #27ae60;
    }

    &:focus {
      background-color: #186a3b;
      border-color: #186a3b;
    }

    &:active {
      background-color: #186a3b;
      border-color: #186a3b;
    }

    &.btn-loading {
      &:disabled {
        background-color: #1e8449 !important;
        color: white !important;
      }
    }
  }

  &.btn-cyan {
    background-color: #08979c;
    border-color: #08979c;
    color: white;

    &:hover {
      background-color: #0fadb3;
      border-color: #0fadb3;
    }

    &:focus {
      background-color: #0fadb3;
      border-color: #0fadb3;
    }

    &:active {
      background-color: #045e61;
      border-color: #045e61;
    }

    &.btn-loading {
      &:disabled {
        background-color: #045e61 !important;
        color: white !important;
      }
    }
  }

  &.btn-purple {
    background-color: #9059e9;
    border-color: #d3adf7;
    color: white;

    &:hover {
      background-color: #7736e0;
      border-color: #d3adf7;
    }

    &:focus {
      background-color: #3b147a;
      border-color: #d3adf7;
    }

    &:active {
      background-color: #3b147a;
      border-color: #d3adf7;
    }

    &.btn-loading {
      &:disabled {
        background-color: #3b147a !important;
        color: white !important;
      }
    }
  }

  &.btn-red {
    background-color: #fff;
    border-color: #ef4444;
    color: #ef4444;

    &:hover {
      background-color: #fff;
      border-color: #ef4444;
    }

    &:focus {
      background-color: #fff;
      border-color: #ef4444;
    }

    &:active {
      background-color: #fff;
      border-color: #ef4444;
    }

    &.btn-loading {
      &:disabled {
        background-color: #fff !important;
        color: #ef4444 !important;
      }
    }
  }

  // CSS for Ripple effect
  &:not(:disabled)::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(100% + 8px);
    height: calc(100% + 8px);
    border-radius: 4px;
    border: 4px solid transparent;
    transform: translate(-50%, -50%);
    transition:
      transform 0.3s,
      opacity 0.3s,
      border-color 0.3s;
    pointer-events: none;
  }

  &:not(:disabled):active::after {
    transform: translate(-50%, -50%);
    border: 4px solid var(--c-primary);
    opacity: 0;
  }
}
</style>
