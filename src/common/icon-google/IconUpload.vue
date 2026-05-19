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
      d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"
    />
  </svg>
</template>
