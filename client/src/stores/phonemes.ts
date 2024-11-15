import { defineStore } from 'pinia'

import { ref } from 'vue'

export const usePhonemesStore = defineStore('phonemes', () => {
  const phonemes = ref<IPhonemeObj[]>([])

  return { phonemes }
})

interface IPhonemeObj {
  id: string
  phoneme: string
}
