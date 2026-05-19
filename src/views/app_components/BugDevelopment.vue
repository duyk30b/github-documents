<script lang="ts" setup>
import { IconBug } from '../../common/icon-antd'
import { VueTooltip } from '../../common/popover'
import { CONFIG } from '../../config'

const props = withDefaults(
  defineProps<{
    data: object
    maxHeight?: number | string
    maxWidth?: number | string
  }>(),
  {
    maxWidth: '800px',
    maxHeight: '600px',
  },
)
</script>

<template>
  <VueTooltip v-if="CONFIG.MODE === 'development'" :max-height="maxHeight" :max-width="maxWidth">
    <template #trigger>
      <IconBug style="color: violet; cursor: pointer" width="1.2em" height="1.2em" />
    </template>
    <pre style="">{{ JSON.stringify(data, null, 4) }}</pre>
  </VueTooltip>
</template>

<style scoped>
a {
  color: inherit;
  text-decoration: none;
}
/* pre {
  white-space: pre-wrap;
  overflow-wrap: break-word;
} */
</style>
