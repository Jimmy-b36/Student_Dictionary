<template>
  <Button
    aria-label="Delete"
    icon="pi pi-times"
    variant="text"
    class="p-button-rounded p-button-danger close"
    @click="visible = true"
  ></Button>
  <Dialog
    v-model:visible="visible"
    modal
    :header="`Remove ${isPhoneme ? 'phoneme' : 'phonogram'}`"
    :style="{ width: '25rem' }"
  >
    <h5 class="text-surface-500 dark:text-surface-400 block mb-8">
      Are you sure you want to remove the {{ props.isPhoneme ? 'phoneme' : 'phonogram' }}
      <strong
        ><em>{{ props.tag }}</em></strong
      >
      from the word
      <strong
        ><em>{{ props.word }}</em></strong
      >?
    </h5>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
      <Button type="button" label="Remove" severity="danger" @click="removeTag"></Button>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import { useDictionaryService } from '@/composables/dictionary.service'

import { ref } from 'vue'
const props = defineProps(['word', 'tag', 'tagId', 'isPhoneme', 'wordId'])
const visible = ref(false)

const { removeTagFromWord } = useDictionaryService()

const removeTag = () => {
  removeTagFromWord(props.word, props.wordId, { id: props.tagId, tag: props.tag }, props.isPhoneme)
  visible.value = false
}
</script>
<style lang="scss" scoped>
.close {
  height: 0.5rem !important;
  width: 1rem !important;
  padding: 0.5rem !important;
  font-size: 0.75rem !important;
}
</style>
