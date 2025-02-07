<template>
  <Button
    aria-label="Delete"
    icon="pi pi-times"
    variant="text"
    class="p-button-rounded p-button-danger close p-2"
    @click="visible = true"
    :disabled="loading"
  ></Button>
  <Dialog
    v-model:visible="visible"
    modal
    :header="`Remove ${props.isPhoneme ? 'phoneme' : 'phonogram'}`"
    :style="{ width: '25rem' }"
  >
    <h5 class="text-surface-500 dark:text-surface-400 block">
      Are you sure you want to remove the {{ props.isPhoneme ? 'phoneme' : 'phonogram' }}
      <strong
        ><em>{{ props.tag }}</em></strong
      >
      from the word
      <strong
        ><em>{{ props.word }}</em></strong
      >?
    </h5>
    <Message severity="error" v-if="errorMessage" class="mb-2">{{ errorMessage }}</Message>
    <div class="flex justify-end gap-2">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="visible = false"
        :disabled="loading"
      ></Button>
      <Button
        type="button"
        label="Remove"
        severity="danger"
        @click="removeTag"
        :loading="loading"
      ></Button>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import { useDictionaryService } from '@/composables/dictionary.service'

import { ref } from 'vue'
const props = defineProps(['word', 'tag', 'tagId', 'isPhoneme', 'wordId'])
const { removeTagFromWord } = useDictionaryService()
const visible = ref(false)
const errorMessage = ref<string>('')
const loading = ref(false)
const ERROR_TIMEOUT = 3000

const removeTag = async () => {
  try {
    loading.value = true
    await removeTagFromWord(
      props.word,
      props.wordId,
      { id: props.tagId, tag: props.tag },
      props.isPhoneme
    )
    visible.value = false
  } catch (error: any) {
    errorMessage.value = error.message
    setTimeout(() => {
      errorMessage.value = ''
    }, ERROR_TIMEOUT)
  } finally {
    loading.value = false
  }
}
</script>
<style lang="scss" scoped>
.close {
  height: 0.5rem !important;
  width: 1rem !important;
  padding: 0.75rem !important;
  font-size: 0.75rem !important;
}
</style>
