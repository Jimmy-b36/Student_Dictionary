<template>
  <div class="flex items-center space-x-2 mb-4">
    <InputText v-model="wordSearchParams" placeholder="Word Search" class="mr-2" />

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
  <DictionaryTable :loading="isLoading" />
</template>

<script setup lang="ts">
import { useSearchService } from '@/composables/search.service'
import { useStudentService } from '@/composables/student.service'
import { useDictionaryStore } from '@/stores/dictionary'
import { useSearchStore } from '@/stores/searchStore'

import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { onMounted, ref, watch } from 'vue'
import DictionaryTable from './DictionaryTable.vue'

const searchStore = useSearchStore()
const { searchState, isSearching } = storeToRefs(searchStore)
const { phonemes, phonograms, loading } = storeToRefs(useDictionaryStore())
const { search } = useSearchService()
const studentService = useStudentService()

const isLoading = computed(() => isSearching.value || loading.value)

const phonemeSearchParams = ref<{ id: string; phoneme: string }[]>([])
const phonogramSearchParams = ref<{ id: string; phonogram: string }[]>([])

const wordSearchParams = ref('')

const handleWordSearchChange = (value: string) => {
  searchState.value.currentFilters.word = value === '' ? null : value
  search()
}

const handlePhonemeSearchChange = (value: { id: string; phoneme: string }[]) => {
  searchState.value.currentFilters.phoneme = value.length === 0 ? null : new Set(value)
  search()
}

const handlePhonogramSearchChange = (value: { id: string; phonogram: string }[]) => {
  searchState.value.currentFilters.phonogram = value.length === 0 ? null : new Set(value)
  search()
}

onMounted(async () => {
  try {
    await studentService.fetchStudents()
  } catch (error) {
    console.log('🥶', error)
  }
})

watch(wordSearchParams, (value) => {
  handleWordSearchChange(value)
})

watch(phonemeSearchParams, (value) => {
  handlePhonemeSearchChange(value)
})

watch(phonogramSearchParams, (value) => {
  handlePhonogramSearchChange(value)
})
</script>
