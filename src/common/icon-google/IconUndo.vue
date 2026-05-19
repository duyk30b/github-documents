<script lang="ts" setup>
const props = withDefaults(defineProps<{ width?: number | string; height?: number | string }>(), {
  width: '1em',
  height: '1em',
})
</script>
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    fill="currentColor"
    viewBox="0 -960 960 960"
  >
    <path
      d="M280-200v-80h284q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l104 104-56 56-200-200 200-200 56 56-104 104h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H280Z"
    />
  </svg>
</template>
