import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSearchService } from '../search.service'
import { useDictionaryStore } from '@/stores/dictionary'
import { useSearchStore } from '@/stores/searchStore'
import { setActivePinia, createPinia } from 'pinia'

// Create dedicated spies
const getDictionaryPageSpy = vi.fn().mockImplementation(async () => {
  console.log('🔥 Mock getDictionaryPage called')
})

const wordSearchSpy = vi.fn().mockImplementation(async () => {
  console.log('🔥 Mock wordSearch called')
})

const phonemeSearchSpy = vi.fn().mockImplementation(async () => {
  console.log('🔥 Mock phonemeSearch called')
})

const phonogramSearchSpy = vi.fn().mockImplementation(async () => {
  console.log('🔥 Mock phonogramSearch called')
})

// Mock the dictionary service
vi.mock('../dictionary.service', () => ({
  useDictionaryService: vi.fn(() => ({
    wordSearch: wordSearchSpy,
    phonemeSearch: phonemeSearchSpy,
    phonogramSearch: phonogramSearchSpy,
    getDictionaryPage: getDictionaryPageSpy
  }))
}))

describe('Search Service', () => {
  let searchService: ReturnType<typeof useSearchService>
  let mockDictionary: Map<string, any>
  let searchStore: ReturnType<typeof useSearchStore>
  let dictionaryStore: ReturnType<typeof useDictionaryStore>

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create a fresh pinia instance for each test
    const pinia = createPinia()
    setActivePinia(pinia)

    // Setup mock dictionary data
    mockDictionary = new Map([
      [
        'cat',
        {
          wordId: '1',
          phonemes: new Set([
            { id: '1', phoneme: 'k' },
            { id: '2', phoneme: 'æ' },
            { id: '3', phoneme: 't' }
          ]),
          phonograms: new Set([{ id: '1', phonogram: 'at' }])
        }
      ],
      [
        'dog',
        {
          wordId: '2',
          phonemes: new Set([
            { id: '4', phoneme: 'd' },
            { id: '5', phoneme: 'ɒ' },
            { id: '6', phoneme: 'g' }
          ]),
          phonograms: new Set([{ id: '2', phonogram: 'og' }])
        }
      ]
    ])

    // Initialize stores
    searchStore = useSearchStore()
    dictionaryStore = useDictionaryStore()

    // Setup initial store state
    searchStore.searchState.initialResults = mockDictionary
    searchStore.searchState.filteredResults = null
    dictionaryStore.dictionary = mockDictionary

    searchService = useSearchService()
  })

  describe('wordFilter', () => {
    it('should filter words by exact match', () => {
      const result = searchService.wordFilter('cat')
      expect(result.size).toBe(1)
      expect(result.has('cat')).toBe(true)
    })

    it('should return empty map when no matches found', () => {
      const result = searchService.wordFilter('xyz')
      expect(result.size).toBe(0)
    })
  })

  describe('phonemeFilter', () => {
    it('should only return words with all specified phonemes', () => {
      let result = searchService.phonemeFilter([{ id: '1', phoneme: 'k' }])
      expect(result.size).toBe(0)

      result = searchService.phonemeFilter([
        { id: '1', phoneme: 'k' },
        { id: '2', phoneme: 'æ' }
      ])
      expect(result.size).toBe(0)

      result = searchService.phonemeFilter([
        { id: '1', phoneme: 'k' },
        { id: '2', phoneme: 'æ' },
        { id: '3', phoneme: 't' }
      ])
      expect(result.size).toBe(1)
      expect(result.has('cat')).toBe(true)
    })

    it('should return empty map when no matches found', () => {
      const result = searchService.phonemeFilter([{ id: '999', phoneme: 'x' }])
      expect(result.size).toBe(0)
    })
  })

  describe('phonogramFilter', () => {
    it('should filter words by phonogram IDs', () => {
      const result = searchService.phonogramFilter([{ id: '1', phonogram: 'at' }])
      expect(result.size).toBe(1)
      expect(result.has('cat')).toBe(true)
    })

    it('should return empty map when no matches found', () => {
      const result = searchService.phonogramFilter([{ id: '999', phonogram: 'xyz' }])
      expect(result.size).toBe(0)
    })
  })

  describe('search', () => {
    it('should call getDictionaryPage when there have been filters set then removed', async () => {
      // First set some filters and search
      searchStore.searchState.currentFilters.word = 'cat'
      searchStore.searchState.currentFilters.phoneme = new Set([{ id: '1', phoneme: 'k' }])
      searchStore.searchState.currentFilters.phonogram = new Set([{ id: '1', phonogram: 'at' }])
      await searchService.search()

      // Verify that getDictionaryPage was NOT called when filters were active
      expect(getDictionaryPageSpy).not.toHaveBeenCalled()

      // Then remove all filters and reset the dictionary to initial state
      searchStore.searchState.currentFilters.word = null
      searchStore.searchState.currentFilters.phoneme = null
      searchStore.searchState.currentFilters.phonogram = null
      dictionaryStore.dictionary = mockDictionary
      searchStore.searchState.initialResults = mockDictionary
      searchStore.searchState.filteredResults = null

      await searchService.search()

      // Now getDictionaryPage should be called since there are no active filters
      expect(getDictionaryPageSpy).toHaveBeenCalled()
    })

    it('should call wordSearch when only word filter is active', async () => {
      searchStore.searchState.currentFilters.word = 'cat'

      await searchService.search()
      expect(wordSearchSpy).toHaveBeenCalledWith('cat')
    })

    it('should apply multiple filters locally when more than one filter is active', async () => {
      searchStore.searchState.currentFilters.word = 'cat'
      searchStore.searchState.currentFilters.phoneme = new Set([{ id: '1', phoneme: 'k' }])

      await searchService.search()

      // Verify that no API calls were made
      expect(wordSearchSpy).not.toHaveBeenCalled()
      expect(phonemeSearchSpy).not.toHaveBeenCalled()
      expect(phonogramSearchSpy).not.toHaveBeenCalled()
      expect(getDictionaryPageSpy).not.toHaveBeenCalled()
    })
  })
})
