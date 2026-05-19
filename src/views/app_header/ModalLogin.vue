<script lang="ts" setup>
import { ref } from 'vue'
import { IconClose, IconEye } from '../../common/icon-antd'
import { AlertStore } from '../../common/vue-alert'
import { InputText } from '../../common/vue-form'
import { VueModal } from '../../common/vue-modal'
import VueButton from '../../common/VueButton.vue'
import { LocalStorageKeys } from '../../config'
import { useAuthStore } from '../../stores/auth.store'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const authStore = useAuthStore()

const showModal = ref(false)
const saveLoading = ref(false)

const tokenInput = ref('')
const tokenDefault = ''

const openModal = () => {
  showModal.value = true
  tokenInput.value = localStorage.getItem(LocalStorageKeys.token) || ''
}

const reset = () => {
  tokenInput.value = ''
}

const closeModal = () => {
  reset()
  showModal.value = false
}

const handleLogin = async () => {
  saveLoading.value = true
  try {
    localStorage.setItem(LocalStorageKeys.token, tokenInput.value)
    await authStore.loginByToken(tokenInput.value)
    emit('success')
    closeModal()
  } catch (error: any) {
    console.log('🚀 ~ ModalLogin.vue:44 ~ handleLogin ~ error:', error)
    AlertStore.addError(error.message)
  } finally {
    saveLoading.value = false
  }
}

defineExpose({ openModal })
</script>

<template>
  <VueModal v-model:show="showModal" :style="{ marginTop: '50px' }">
    <form class="login-modal" @submit.prevent="handleLogin">
      <div class="login-head">
        <div class="login-title">GitHub Token Login</div>
        <button type="button" class="close-btn" @click="tokenInput = tokenDefault" style="opacity: 0">
          <IconEye />
        </button>
        <button type="button" class="close-btn ml-auto" @click="closeModal">
          <IconClose />
        </button>
      </div>

      <div class="content">
        <ol class="steps">
          <li>
            1.
            <a
              class="helper-link"
              href="https://github.com/settings/personal-access-tokens"
              target="_blank"
              rel="noreferrer"
            >
              Open GitHub token settings
            </a>
          </li>
          <li>2. Create a fine-grained token.</li>
          <li>3. Select only the <strong>github-documents</strong> repository.</li>
          <li>4. Grant <strong>Contents: Read and write</strong>.</li>
          <li>5. Copy the token and paste it here.</li>
        </ol>
        <InputText v-model:value="tokenInput" placeholder="Paste GitHub token" />
      </div>

      <div class="footer">
        <div class="flex gap-4">
          <VueButton style="margin-left: auto" type="reset" icon="close" @click="closeModal"> Cancel </VueButton>
          <VueButton color="blue" type="submit" :loading="saveLoading" icon="save"> Login </VueButton>
        </div>
      </div>
    </form>
  </VueModal>
</template>

<style lang="scss" scoped>
.login-modal {
  color: var(--c-text);
  background: var(--c-bg-elevated);
  border: 1px solid var(--c-border);
  border-radius: 14px;
}

.login-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--c-border);
}

.login-title {
  font-size: 1.06rem;
  font-weight: 700;
}

.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--c-border);
  border-radius: 999px;
  color: var(--c-text-soft);
  background: var(--c-surface-1);
  cursor: pointer;

  &:hover {
    color: var(--c-primary);
    border-color: var(--c-primary);
  }
}

.content {
  margin-top: 0.25rem;
  padding: 0 1rem;
}

.steps {
  margin: 0.85rem 0 0.85rem 0;
  padding: 0;
  color: var(--c-text);
  display: grid;
  gap: 0.35rem;
  line-height: 1.5;
}

.helper-link {
  display: inline-flex;
  color: var(--c-primary);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--c-primary) 52%, transparent);
  text-underline-offset: 2px;
  font-weight: 600;
}

.helper-link:hover {
  text-decoration-color: var(--c-primary);
}

.footer {
  padding: 1rem;
  margin-top: 0.2rem;
}
</style>
