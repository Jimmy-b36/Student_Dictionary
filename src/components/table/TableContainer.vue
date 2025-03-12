<template>
  <div class="flex items-center space-x-2 mb-4">
    <InputText v-model="wordSearchParams" class="mr-2" />

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
  <Table :loading="isSearching" />
</template>

<script setup lang="ts">
import { useSearchService } from '@/composables/search.service'
import { useDictionaryStore } from '@/stores/dictionary'
import { useSearchStore } from '@/stores/searchStore'

import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

const searchStore = useSearchStore()
const { searchState, isSearching } = storeToRefs(searchStore)
const { phonemes, phonograms } = storeToRefs(useDictionaryStore())
const { search } = useSearchService()

const phonemeSearchParams = ref<{ id: string; phoneme: string }[]>([])
const phonogramSearchParams = ref<{ id: string; phonogram: string }[]>([])

const wordSearchParams = ref('')

const handleSearchParamChange = <T,>(
  type: 'word' | 'phoneme' | 'phonogram',
  value: T,
  isEmpty: (val: T) => boolean
) => {
  if (isEmpty(value)) {
    searchState.value.currentFilters[type] = null
    search()
  } else {
    if (type === 'word') {
      searchState.value.currentFilters.word = value as string
    } else {
      searchState.value.currentFilters[type] = new Set(value as any[])
    }
    search()
  }
}

watch(wordSearchParams, (value) => {
  handleSearchParamChange('word', value, (val) => val === '')
})

watch(phonemeSearchParams, (value) => {
  handleSearchParamChange('phoneme', value, (val) => val.length === 0)
})

watch(phonogramSearchParams, (value) => {
  handleSearchParamChange('phonogram', value, (val) => val.length === 0)
})
</script>
