<template>
  <Button icon="pi pi-plus" severity="secondary" rounded @click="visible = true" />

  <Dialog v-model:visible="visible" modal :style="{ width: '25rem' }">
    <template #header>
      <h2 class="text-lg font-bold">
        {{ `Add ${isPhoneme ? 'phoneme(s)' : 'phonogram(s)'} to ` }}<em>{{ word }}</em>
      </h2>
    </template>
    <p>Max tags: 3</p>
    <MultiSelect
      v-model="selectedTags"
      :options="options"
      :optionLabel="isPhoneme ? 'phoneme' : 'phonogram'"
      filter
      placeholder="Select Tags"
      :maxSelectedLabels="3"
      class="w-full md:w-100 mb-4"
      :disabled="loading"
      :selectionLimit="3"
    />

    <Message
      v-for="error of errorMessage"
      :key="error"
      severity="error"
      class="mb-2 md:w-100"
      v-if="errorMessage.length"
      >{{ error }}</Message
    >
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
        label="Add"
        severity="secondary"
        @click="addTag(props.wordId, props.isPhoneme)"
        :loading="loading"
      ></Button>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import { useDictionaryService } from '@/composables/dictionary.service'
import { useDictionaryStore } from '@/stores/dictionary'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'

const props = defineProps(['word', 'wordId', 'isPhoneme'])
const { phonemes, phonograms } = storeToRefs(useDictionaryStore())
const { addTagToWord } = useDictionaryService()

const selectedTags = ref<any>([])
const options = ref<{}[]>([])
const errorMessage = ref<string[]>([])
const visible = ref(false)
const loading = ref(false)
const ERROR_TIMEOUT = 3000

const addTag = async (wordId: string, isPhoneme: boolean) => {
  try {
    if (!selectedTags.value.length) {
      throw new Error('Please select at least one tag')
    }
    errorMessage.value = []
    loading.value = true

    // I don't want it to completely fail just because one tag fails
    await Promise.all(
      selectedTags.value.map(async (tag: { id: string; tag: string }) => {
        try {
          const res = await addTagToWord(props.word, wordId, tag, isPhoneme)
          if (res.type === 'error') {
            errorMessage.value.push(res.message)
          }
        } catch (error: any) {
          console.log('🔥', error)
        }
      })
    )
    if (errorMessage.value.length) return

    visible.value = false
    selectedTags.value = []
  } catch (error: any) {
    errorMessage.value = [error.message]
    setTimeout(() => {
      errorMessage.value = []
    }, ERROR_TIMEOUT)
  } finally {
    loading.value = false
  }
}

watch(selectedTags, () => {
  errorMessage.value = []
})

onMounted(() => {
  options.value = props.isPhoneme ? phonemes.value : phonograms.value
})
</script>
<style lang="scss" scoped></style>
