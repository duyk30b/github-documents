<script lang="ts" setup>
import { IconSort, IconSortDown, IconSortUp } from '.'

const props = withDefaults(
  defineProps<{ width?: number | string; height?: number | string; sort: 'ASC' | 'DESC' | '' }>(),
  {
    width: '1em',
    height: '1em',
    sort: '',
  },
)
</script>
<template>
  <IconSort v-if="!sort" style="opacity: 0.4" />
  <IconSortUp v-if="sort === 'ASC'" />
  <IconSortDown v-if="sort === 'DESC'" />
</template>
