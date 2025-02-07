import type { IDictionaryEntry } from '@/composables/dictionary.service'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDictionaryStore = defineStore('dictionary', () => {
  const dictionary = ref<IDictionary>(new Map())
  const phonemes = ref<IPhonemeObj[]>([])
  const phonograms = ref<IPhonogramObj[]>([])

  return { dictionary, phonemes, phonograms }
})

export interface IDictionary extends Map<string, IDictionaryEntry> {}

export interface IPhonemeObj {
  id: string
  phoneme: string
}

export interface IPhonogramObj {
  id: string
  phonogram: string
}
