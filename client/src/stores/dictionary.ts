import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDictionaryStore = defineStore('dictionary', () => {
  const dictionary = ref<IDictionary>(new Map())

  return { dictionary }
})

export interface IDictionary extends Map<string, { word: string; phonemes: Set<string> }> {}
