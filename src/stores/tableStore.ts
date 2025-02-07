// stores/tableStore.ts
import { useDictionaryService } from '@/composables/dictionary.service'
import { useDictionaryStore } from '@/stores/dictionary'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

export interface TableRow {
  id: string
  word: string
  phonemes: { id: string; phoneme: string }[]
  phonograms: { id: string; phonogram: string }[]
}

export const useTableStore = defineStore('table', () => {
  const { dictionary } = storeToRefs(useDictionaryStore())
  const { getDictionaryPage } = useDictionaryService()

  const searchParam = ref([])

  const tableData = computed<TableRow[]>(() => {
    return Array.from(dictionary.value, ([key, data]) => ({
      id: data.wordId,
      word: key,
      phonemes: Array.from(data.phonemes),
      phonograms: Array.from(data.phonograms)
    }))
  })

  const fetchNextPages = async (currentPage: number, pageSize = 100) => {
    return await getDictionaryPage(currentPage, pageSize)
  }

  return {
    tableData,
    fetchNextPages,
    searchParam
  }
})
