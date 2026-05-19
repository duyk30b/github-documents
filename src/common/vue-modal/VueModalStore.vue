<script lang="ts" setup>
import { ref } from 'vue'
import VueButton from '../VueButton.vue'
import { IconClose, IconExclamationCircle, IconQuestionCircle } from '../icon-antd'
import VueModal from './VueModal.vue'
import { ModalStore } from './vue-modal.store'

const saveLoading = ref(false)

const handleUpdateShowModal = (show: boolean, key: string) => {
  if (!show) {
    ModalStore.remove(key)
  }
}

const handleOk = async (func: () => Promise<void>, key: string) => {
  saveLoading.value = true
  try {
    await func()
    ModalStore.remove(key)
  } catch (error) {
    console.log('🚀 ~ file: VueModalStore.vue:23 ~ handleOk ~ error:', error)
  } finally {
    saveLoading.value = false
  }
}

const handleCancel = async (func: () => Promise<void>, key: string) => {
  await func()
  ModalStore.remove(key)
}
</script>

<template>
  <template v-for="(modal, key) in ModalStore.data" :key="key">
    <VueModal
      v-model:show="modal.show"
      :style="modal.style"
      :modalMaskStyle="modal.modalMaskStyle"
      @update:show="(v) => handleUpdateShowModal(v, key)"
    >
      <div class="bg-white">
        <div class="pl-4 py-3 flex items-center" style="border-bottom: 1px solid #dedede">
          <div class="flex-1 flex items-center gap-2">
            <span
              v-if="modal.type === 'confirm'"
              style="line-height: 0; font-size: 18px; color: red"
            >
              <IconQuestionCircle />
            </span>
            <span v-if="modal.type === 'alert'" style="line-height: 0; font-size: 18px; color: red">
              <IconExclamationCircle />
            </span>
            <span class="font-medium" style="font-size: 16px">{{ modal.title }}</span>
          </div>
          <div
            style="font-size: 1.2rem"
            class="px-4 cursor-pointer"
            @click="ModalStore.remove(key)"
          >
            <IconClose />
          </div>
        </div>
        <div v-if="modal.contentType === 'text'" class="p-4">
          <template v-if="Array.isArray(modal.content)">
            <p v-for="(content, index) in modal.content" :key="index">{{ content }}</p>
          </template>
          <template v-if="typeof modal.content === 'string'">
            <p>{{ modal.content }}</p>
          </template>
        </div>
        <div
          v-if="modal.contentType === 'html' && typeof modal.content === 'string'"
          class="p-4"
          v-html="modal.content"
        ></div>
        <div class="p-4">
          <div class="flex gap-4">
            <VueButton
              v-if="modal.cancelText"
              style="margin-left: auto"
              type="reset"
              @click="handleCancel(modal.onCancel, key)"
            >
              {{ modal.cancelText }}
            </VueButton>
            <VueButton
              v-if="modal.okText && modal.type === 'confirm'"
              color="blue"
              :loading="saveLoading"
              @click="handleOk(modal.onOk, key)"
            >
              {{ modal.okText }}
            </VueButton>
          </div>
        </div>
      </div>
    </VueModal>
  </template>
</template>

<style lang="scss" scoped></style>
