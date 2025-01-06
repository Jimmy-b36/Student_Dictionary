import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useDictionaryStore } from '../stores/dictionary'
import { pb } from '../utils/pocketbaseConnection'

interface IDictionaryResponse {
  id: string
  word: string
  expand: {
    'word_phonemes(word)': IWordPhoneme[]
    'word_phonograms(word)': IWordPhonogram[]
  }
}

interface IPhonemeResponse {
  id: string
  phoneme: string
  expand: {
    'word_phonemes(phoneme)': IWordPhoneme[]
  }
}

interface IWordPhoneme {
  expand: {
    phoneme: { phoneme: string }
    word: { word: string }
  }
}

interface IWordPhonogram {
  expand: {
    phonogram: { phonogram: string }
    word: { word: string }
  }
}

export interface ITableHeaders {
  id: string
  word: string
  phonemes: string[]
  phonograms: string[]
}

export interface IDictionaryEntry {
  word: string
  phonemes: Set<string>
  phonograms: Set<string>
}

export const useDictionaryService = () => {
  const { dictionary } = storeToRefs(useDictionaryStore())
  const initialItemsCache = ref<Map<string, IDictionaryEntry>>(new Map())

  const getDictionaryPage = async (currentPage: number = 1, pageSize = 50) => {
    dictionary.value.clear()
    try {
      const response = await pb
        .collection('global_dictionary')
        .getList<IDictionaryResponse>(currentPage, pageSize, {
          expand: 'word_phonemes(word).phoneme,word_phonograms(word).phonogram',
          fields:
            'id, word,expand.word_phonemes(word).expand.phoneme.phoneme,expand.word_phonograms(word).expand.phonogram.phonogram'
        })

      if (currentPage === 1) {
        initialItemsCache.value.clear()
      }

      response.items.forEach(({ word, expand }) => {
        const phonemes = expand?.['word_phonemes(word)']?.map(
          (phoneme) => phoneme.expand.phoneme.phoneme
        )
        const phonograms = expand?.['word_phonograms(word)']?.map(
          (phonogram) => phonogram.expand.phonogram.phonogram
        )

        const entry: IDictionaryEntry = {
          word,
          phonemes: new Set(phonemes),
          phonograms: new Set(phonograms)
        }

        dictionary.value.set(word, entry)

        if (currentPage === 1) {
          initialItemsCache.value.set(word, entry)
        }
      })
    } catch (error) {
      console.error('Error fetching dictionary page:', error)
      throw error
    }
  }

  const searchDictionary = async (searchParam: string) => {
    searchParam = searchParam.trim()
    dictionary.value.clear()
    if (!searchParam) {
      if (initialItemsCache.value.size === 0) {
        await getDictionaryPage(1, 50)
      } else {
        // Restore from cache
        initialItemsCache.value.forEach((entry, word) => {
          dictionary.value.set(word, entry)
        })
      }
      return
    }

    let result

    try {
      // Word search
      result = await pb.collection('global_dictionary').getList<IDictionaryResponse>(1, 30, {
        filter: `word~"${searchParam}"`,
        expand: 'word_phonograms(word).phonogram,word_phonemes(word).phoneme',
        fields:
          'id, word,expand.word.expand.word_phonograms(word).expand.phonogram.phonogram,expand.word.expand.word_phonemes(word).expand.phoneme.phoneme'
      })
      if (result.items.length) {
        result.items.forEach(({ word, expand }) => {
          const phonemes = expand?.['word_phonemes(word)']?.map(
            (phoneme) => phoneme.expand.phoneme.phoneme
          )
          const phonograms = expand?.['word_phonograms(word)']?.map(
            (phonogram) => phonogram.expand.phonogram.phonogram
          )
          dictionary.value.set(word, {
            word,
            phonemes: new Set(phonemes),
            phonograms: new Set(phonograms)
          })
        })
        return
      }

      // Phoneme search
      result = await pb.collection('word_phonemes').getList(1, 30, {
        filter: `phoneme.phoneme~"${searchParam}"`,
        expand: 'word.word_phonemes(word).phoneme,word.word_phonograms(word).phonogram',
        fields:
          'id,expand.word.word,expand.word.expand.word_phonograms(word).expand.phonogram.phonogram,expand.word.expand.word_phonemes(word).expand.phoneme.phoneme'
      })

      if (result.items.length) {
        result.items.forEach(({ expand }) => {
          if (!expand?.word) return

          const phonemes = expand.word.expand['word_phonemes(word)']?.map(
            (phoneme: any) => phoneme.expand.phoneme.phoneme
          )
          const phonograms = expand.word.expand?.['word_phonograms(word)']?.map(
            (phonogram: any) => phonogram.expand.phonogram.phonogram
          )

          const word = expand.word.word
          dictionary.value.set(word, {
            word,
            phonemes: new Set(phonemes),
            phonograms: new Set(phonograms)
          })
        })
        return
      }

      // Phonogram search
      result = await pb.collection('word_phonograms').getList(1, 30, {
        filter: `phonogram.phonogram~"${searchParam}"`,
        expand: 'word.word_phonemes(word).phoneme,word.word_phonograms(word).phonogram',
        fields:
          'id,expand.word.word,expand.word.expand.word_phonograms(word).expand.phonogram.phonogram,expand.word.expand.word_phonemes(word).expand.phoneme.phoneme'
      })

      if (result.items.length) {
        result.items.forEach(({ expand }) => {
          if (!expand?.word) return

          const phonemes = expand.word.expand['word_phonemes(word)']?.map(
            (phoneme: any) => phoneme.expand.phoneme.phoneme
          )
          const phonograms = expand.word.expand?.['word_phonograms(word)']?.map(
            (phonogram: any) => phonogram.expand.phonogram.phonogram
          )

          const word = expand.word.word
          dictionary.value.set(word, {
            word,
            phonemes: new Set(phonemes),
            phonograms: new Set(phonograms)
          })
        })
        return
      }
    } catch (error) {
      console.error('Error searching dictionary:', error)
      throw error
    }
  }

  return {
    getDictionaryPage,
    searchDictionary
  }
}
