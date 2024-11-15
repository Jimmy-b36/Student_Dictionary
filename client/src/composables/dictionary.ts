import { storeToRefs } from 'pinia'
import { useDictionaryStore, type IDictionary } from '../stores/dictionary'
import { pb } from '../utils/pocketbaseConnection'

export const useDictionary = () => {
  const { dictionary } = storeToRefs(useDictionaryStore())

  const fetchDictionary = async (currentPage: number = 1, pageSize: number = 30) => {
    const response = await pb.collection('word_phonemes').getList(currentPage, pageSize, {
      expand: 'word,phoneme'
    })
    dictionary.value.clear()

    response.items.forEach((item) => {
      const word = item.expand?.word?.word
      const phoneme = item.expand?.phoneme?.phoneme
      dictionary.value.set(word, {
        word,
        phonemes: new Set([...(dictionary.value.get(word)?.phonemes || []), phoneme])
      })
    })
  }

  return {
    fetchDictionary
  }
}
