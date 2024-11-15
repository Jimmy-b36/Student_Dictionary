import { storeToRefs } from 'pinia'
import { useDictionaryStore } from '../stores/dictionary'
import { pb } from '../utils/pocketbaseConnection'

interface WordPhoneme {
  expand: {
    word: { word: string }
    phoneme: { phoneme: string }
  }
}

export interface DictionaryEntry {
  word: string
  phonemes: Set<string>
}

export const useDictionary = () => {
  const { dictionary } = storeToRefs(useDictionaryStore())

  const fetchDictionary = async (currentPage: number = 1, pageSize: number = 30) => {
    const response = await pb
      .collection('word_phonemes')
      .getList<WordPhoneme>(currentPage, pageSize, {
        expand: 'word,phoneme'
      })
    dictionary.value.clear()

    response.items.forEach((item) => {
      const word = item.expand.word.word
      const phoneme = item.expand.phoneme.phoneme

      const existingEntry = dictionary.value.get(word)
      dictionary.value.set(word, {
        word,
        phonemes: new Set([...(existingEntry?.phonemes || []), phoneme])
      })
    })
  }

  return {
    fetchDictionary
  }
}
