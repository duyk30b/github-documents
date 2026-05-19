<template>
  <Teleport to="body">
    <div class="wrapper-alert">
      <div v-for="(alert, key) in AlertStore.data" :key="key" :class="`alert ${alert.type}`">
        <div class="prepend" />
        <div v-if="alert.type === 'success'" class="icon">☑</div>
        <div v-if="alert.type === 'warning'" class="icon">⚠</div>
        <div v-if="alert.type === 'error'" class="icon">☒</div>
        <div class="content">
          <div>{{ alert.message }}</div>
        </div>
        <div class="append">
          <button class="btn-close" @click="AlertStore.remove(key)">✕</button>
        </div>
        <div
          class="progress-bar"
          :style="{ width: `${alert.progress}%`, transitionDuration: `${alert.time / 10000}s` }"
        ></div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { AlertStore } from './vue-alert.store'

export default {
  setup() {
    return { AlertStore }
  },
}
</script>

<style lang="scss" scoped>
.wrapper-alert {
  position: fixed;
  top: 4rem;
  right: 1rem;
  z-index: 999999999;

  .alert {
    position: relative;
    margin-top: 20px;
    width: 400px;
    border-radius: 0.5rem;
    display: flex;
    flex-direction: row;

    &.success {
      .prepend {
        background-color: #3ac279;
      }

      .icon {
        background-color: #c5f7dc;
        color: #3dc37b;
      }

      .content {
        background-color: #c5f7dc;
      }

      .append {
        background-color: #c5f7dc;
      }

      .btn-close {
        color: #40c47d;
      }

      .progress-bar {
        background-color: #40c47d;
      }
    }

    &.warning {
      .prepend {
        background-color: #e89f29;
      }

      .icon {
        background-color: #ffe8c3;
        color: #e8a02b;
      }

      .content {
        background-color: #ffe8c3;
      }

      .append {
        background-color: #ffe8c3;
      }

      .btn-close {
        color: #e8a02b;
      }

      .progress-bar {
        background-color: #e8a02b;
      }
    }

    &.error {
      .prepend {
        background-color: rgb(233, 89, 76, 0.9);
      }

      .icon {
        background-color: rgb(255, 207, 203, 0.9);
        color: #e95a4d;
      }

      .content {
        background-color: rgb(255, 207, 203, 0.9);
      }

      .append {
        background-color: rgb(255, 207, 203, 0.9);
      }

      .btn-close {
        color: #ea6155;
      }

      .progress-bar {
        background-color: rgb(233, 89, 76, 0.5);
      }
    }

    .prepend {
      width: 10px;
    }

    .icon {
      padding: 0 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Proxima Nova', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 400;
      font-size: 28px;
    }

    .content {
      padding: 1rem 0;
      color: rgb(60, 60, 60, 0.7);
      flex: 1;
      display: flex;
      align-items: center;
      font-weight: bold;
      font-size: 14px;
    }

    .append {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;

      .btn-close {
        font-weight: bold;
        padding: 0 5px;
        cursor: pointer;
      }
    }

    .progress-bar {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 2px;
      transition-property: width;
      transition-timing-function: linear;
    }

    .close-btn {
      border: none;
      background-color: transparent;
      font-size: 1rem;
      font-weight: bold;
      color: inherit;
      cursor: pointer;
    }
  }
}
</style>
