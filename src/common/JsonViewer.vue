<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string
  }>(),
  {
    text: '',
  }
)

const syntaxHighlight = (objString: string) => {
  return objString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|\b\d+\b)/g,
      (match) => {
        let cls = 'number'
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key'
          } else {
            cls = 'string'
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean'
        } else if (/null/.test(match)) {
          cls = 'null'
        }
        return `<span class="${cls}">${match}</span>`
      }
    )
}

const htmlString = computed(() => {
  const result = syntaxHighlight(props.text)
  return result
})
</script>

<template>
  <div class="json-viewer" v-html="htmlString"></div>
</template>

<style lang="scss">
.json-viewer {
  width: 100%;
  height: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  color: #333;
  font-family: monospace;
  white-space: pre;
  .string {
    color: #2a7ae2;
  } /* xanh lam */
  .number {
    color: #b22a00;
  } /* đỏ đậm */
  .boolean {
    color: #d99000;
  } /* cam vàng */
  .null {
    color: #999;
  } /* xám nhẹ */
  .key {
    color: #008000;
  } /* xanh lá đậm */
}
</style>
