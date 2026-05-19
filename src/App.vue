<script setup lang="ts">
import VueModalStore from './common/vue-modal/VueModalStore.vue'
import VueAlertStore from './common/vue-alert/VueAlertStore.vue'
import MainLayout from './views/MainLayout.vue'
</script>

<template>
  <MainLayout />
  <VueModalStore />
  <VueAlertStore />
</template>
