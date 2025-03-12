import { useDictionaryStore } from '@/stores/dictionary'
import { useSearchStore } from '@/stores/searchStore'
import { storeToRefs } from 'pinia'
import type { IDictionaryEntry } from './dictionary.service'
import { useDictionaryService } from './dictionary.service'

interface IFilters {
  word: string | null
  phoneme: Set<{ id: string; phoneme: string }> | null
  phonogram: Set<{ id: string; phonogram: string }> | null
}

export function useSearchService() {
  const searchStore = useSearchStore()
  const { searchState } = storeToRefs(searchStore)
  const { isSearching, hasResults, hasActiveFilters, activeFiltersCount } = storeToRefs(searchStore)

  const dictionaryStore = useDictionaryStore()
  const { dictionary } = storeToRefs(dictionaryStore)

  const dictionaryService = useDictionaryService()
  const { wordSearch, phonemeSearch, phonogramSearch, getDictionaryPage } = dictionaryService
  // -------------------
  // Filter functions
  // -------------------
  const filterByWord = (
    entries: Map<string, IDictionaryEntry>,
    searchParam: string
  ): Map<string, IDictionaryEntry> => {
    const filtered = new Map<string, IDictionaryEntry>()

    for (const [key, entry] of entries) {
      if (key.includes(searchParam)) {
        filtered.set(key, entry)
      }
    }

    return filtered
  }

  const filterByPhonemes = (
    entries: Map<string, IDictionaryEntry>,
    phonemeIds: string[]
  ): Map<string, IDictionaryEntry> => {
    const filtered = new Map<string, IDictionaryEntry>()

    for (const [key, entry] of entries) {
      const phonemeArr = Array.from(entry.phonemes)
      if (phonemeArr.every((phoneme) => phonemeIds.includes(phoneme.id))) {
        filtered.set(key, entry)
      }
    }

    return filtered
  }

  const filterByPhonograms = (
    entries: Map<string, IDictionaryEntry>,
    phonogramIds: string[]
  ): Map<string, IDictionaryEntry> => {
    const filtered = new Map<string, IDictionaryEntry>()

    for (const [key, entry] of entries) {
      const phonogramArr = Array.from(entry.phonograms)
      if (phonogramArr.every((phonogram) => phonogramIds.includes(phonogram.id))) {
        filtered.set(key, entry)
      }
    }

    return filtered
  }

  // State-updating wrapper functions
  const wordFilter = (searchParam: string) => {
    searchState.value.currentFilters.word = searchParam

    const toFilter = searchState.value.filteredResults || searchState.value.initialResults
    const filtered = filterByWord(toFilter, searchParam)

    return filtered.size > 0 ? filtered : new Map()
  }

  const phonemeFilter = (phonemeSearchArr: { id: string; phoneme: string }[]) => {
    searchState.value.currentFilters.phoneme = new Set(phonemeSearchArr)

    const toFilter = searchState.value.filteredResults || searchState.value.initialResults
    const ids = phonemeSearchArr.map((phoneme) => phoneme.id)
    const filtered = filterByPhonemes(toFilter, ids)

    return filtered.size > 0 ? filtered : new Map()
  }

  const phonogramFilter = (phonogramSearchArr: { id: string; phonogram: string }[]) => {
    searchState.value.currentFilters.phonogram = new Set(phonogramSearchArr)

    const toFilter = searchState.value.filteredResults || searchState.value.initialResults
    const ids = phonogramSearchArr.map((phonogram) => phonogram.id)
    const filtered = filterByPhonograms(toFilter, ids)

    return filtered.size > 0 ? filtered : new Map()
  }

  // Main search function
  const search = async () => {
    searchState.value.status = 'loading'

    if (activeFiltersCount.value === 0) {
      await getDictionaryPage()
      searchState.value.status = 'success'
      return
    }

    if (activeFiltersCount.value > 1) {
      let currentResults = searchState.value.initialResults

      // Apply filters in sequence
      for (const [key, value] of Object.entries(searchState.value.currentFilters as IFilters)) {
        if (!value) continue

        if (key === 'word') {
          currentResults = filterByWord(currentResults, value)
        } else if (key === 'phoneme') {
          const ids = Array.from(value as Set<{ id: string; phoneme: string }>).map((p) => p.id)
          currentResults = filterByPhonemes(currentResults, ids)
        } else if (key === 'phonogram') {
          const ids = Array.from(value as Set<{ id: string; phonogram: string }>).map((p) => p.id)
          currentResults = filterByPhonograms(currentResults, ids)
        }

        if (currentResults.size === 0) break
      }

      searchState.value.filteredResults = currentResults
      dictionary.value = currentResults
      searchState.value.status = 'success'
      return
    }

    // Handle single filter case (DB request)
    const [[key, searchValue]] = Object.entries(searchState.value.currentFilters).filter(
      ([_, value]) => !!value
    )

    if (key === 'word') {
      await wordSearch(searchValue as string)
    } else if (key === 'phoneme') {
      await phonemeSearch(Array.from(searchValue as Set<{ id: string; phoneme: string }>))
    } else if (key === 'phonogram') {
      await phonogramSearch(Array.from(searchValue as Set<{ id: string; phonogram: string }>))
    }
    searchState.value.status = 'success'
  }

  return {
    search,
    wordFilter,
    phonemeFilter,
    phonogramFilter
  }
}
