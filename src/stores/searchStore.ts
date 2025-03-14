import type { IDictionaryEntry } from '@/composables/dictionary.service'
import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'

interface ISearchState {
  filteredResults: Map<string, IDictionaryEntry> | null
  currentFilters: {
    phoneme: Set<{ id: string; phoneme: string }> | null
    phonogram: Set<{ id: string; phonogram: string }> | null
    word: string | null
  }
  initialResults: Map<string, IDictionaryEntry>
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
}

export const useSearchStore = defineStore('search', () => {
  const searchState = reactive<ISearchState>({
    filteredResults: null,

    currentFilters: {
      phoneme: null,
      phonogram: null,
      word: null
    },

    status: 'idle',
    error: null,

    initialResults: new Map<string, IDictionaryEntry>()
  })

  // Computed properties for UI
  const isSearching = computed(() => searchState.status === 'loading')
  const hasResults = computed(() => searchState.filteredResults !== null)
  const hasActiveFilters = computed(
    () =>
      (searchState.currentFilters.phoneme?.size ?? 0 > 0) ||
      (searchState.currentFilters.phonogram?.size ?? 0 > 0) ||
      !!searchState.currentFilters.word
  )
  const activeFiltersCount = computed(() => {
    const { phoneme, phonogram, word } = searchState.currentFilters
    return (
      ((phoneme?.size ?? 0 > 0) ? 1 : 0) + ((phonogram?.size ?? 0 > 0) ? 1 : 0) + (word ? 1 : 0)
    )
  })

  return {
    searchState,
    isSearching,
    hasResults,
    hasActiveFilters,
    activeFiltersCount
  }
})
