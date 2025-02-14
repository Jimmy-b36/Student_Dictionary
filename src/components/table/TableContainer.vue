<template>
  <div class="flex items-center space-x-2 mb-4">
    <InputText v-model="wordSearch" class="mr-2" />

    <MultiSelect
      v-model="phonemeSearchParams"
      :options="phonemes"
      :show-toggle-all="false"
      option-label="phoneme"
      filter
      placeholder="Phonemes"
      display="chip"
      name="phoneme"
      aria-label="Phonemes filter"
    />
    <MultiSelect
      v-model="phonogramSearchParams"
      :options="phonograms"
      :show-toggle-all="false"
      option-label="phonogram"
      filter
      placeholder="Phonograms"
      display="chip"
      name="phonogram"
      aria-label="Phonograms filter"
    />
  </div>
  <Table />
</template>

<script setup lang="ts">
import { useDictionaryService } from '@/composables/dictionary.service'
import { useDictionaryStore } from '@/stores/dictionary'
import { useTableStore } from '@/stores/tableStore'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
const { phonemes, phonograms } = storeToRefs(useDictionaryStore())
const { searchDictionary, phonemeSearch, phonogramSearch } = useDictionaryService()
const tableStore = useTableStore()

const phonemeSearchParams = ref<{ id: string; phoneme: string }[]>([])
const phonogramSearchParams = ref<{ id: string; phonogram: string }[]>([])

const wordSearch = ref('')

// should all the searches work together or one at a time?
watch(phonemeSearchParams, () => {
  phonemeSearch(phonemeSearchParams.value)
})
watch(wordSearch, () => {
  searchDictionary(wordSearch.value)
})

watch(phonogramSearchParams, () => {
  phonogramSearch(phonogramSearchParams.value)
})
</script>
