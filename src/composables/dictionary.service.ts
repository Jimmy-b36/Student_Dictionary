import { useTableStore } from '@/stores/tableStore'
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
    phoneme: { id: string; phoneme: string }
    word: { word: string }
  }
}

interface IWordPhonogram {
  expand: {
    phonogram: { id: string; phonogram: string }
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
  wordId: string
  phonemes: Set<{ id: string; phoneme: string }>
  phonograms: Set<{ id: string; phonogram: string }>
}

export const useDictionaryService = () => {
  const { dictionary, phonemes, phonograms } = storeToRefs(useDictionaryStore())
  const initialItemsCache = ref<Map<string, IDictionaryEntry>>(new Map())
  const { plusOne } = storeToRefs(useTableStore())

  const getDictionaryPage = async (currentPage: number = 1, pageSize = 100) => {
    try {
      const response = await pb
        .collection('global_dictionary')
        .getList<IDictionaryResponse>(currentPage, pageSize, {
          expand: 'word_phonemes(word).phoneme,word_phonograms(word).phonogram',
          fields:
            'id, word,expand.word_phonemes(word).expand.phoneme.phoneme,expand.word_phonograms(word).expand.phonogram.phonogram,expand.word_phonograms(word).expand.phonogram.id,expand.word_phonemes(word).expand.phoneme.id',
          skipTotal: true
        })
      if (currentPage === 1) {
        initialItemsCache.value.clear()
      }

      response.items.forEach(({ word, expand, id }) => {
        const phonemes = expand?.['word_phonemes(word)']?.map((phoneme) => phoneme.expand.phoneme)
        const phonograms = expand?.['word_phonograms(word)']?.map(
          (phonogram) => phonogram.expand.phonogram
        )

        const entry: IDictionaryEntry = {
          wordId: id,
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

  const fetchAllPhonemes = async () => {
    const response = await pb.collection('phonemes').getFullList()
    phonemes.value = response.map((phonemeObj: any) => {
      return {
        id: phonemeObj.id,
        phoneme: phonemeObj.phoneme
      }
    })
  }

  const fetchAllPhonograms = async () => {
    const response = await pb.collection('phonograms').getFullList()
    phonograms.value = response.map((phonogramObj: any) => {
      return {
        id: phonogramObj.id,
        phonogram: phonogramObj.phonogram
      }
    })
  }

  // TODO implement search
  // const phonemeSearch = async (phonemeArr: string[]) => {
  //   console.log('🔥', phonemeArr)
  //   if (phonemeArr.length === 0) {
  //     await getDictionaryPage(1, 100)
  //     return
  //   }

  //   dictionary.value.clear()

  //   const result = await pb.collection('word_phonemes').getFullList({
  //     filter: phonemeArr.map((phoneme) => `phoneme.phoneme~"${phoneme}"`).join('||'),
  //     expand: 'word.word_phonemes(word).phoneme,word.word_phonograms(word).phonogram',
  //     fields:
  //       'expand.word.word,expand.word.expand.word_phonograms(word).expand.phonogram.phonogram,expand.word.expand.word_phonemes(word).expand.phoneme.phoneme,expand.word.expand.word_phonograms(word).expand.phonogram.id,expand.word.expand.word_phonemes(word).expand.phoneme.id'
  //   })

  //   result.forEach(({ expand }) => {
  //     if (!expand?.word) return

  //     const phonemes = new Set<{ id: string; phoneme: string }>(
  //       expand.word.expand['word_phonemes(word)']?.map((phoneme: any) => phoneme.expand.phoneme)
  //     )

  //     const phonograms = new Set<{ id: string; phonogram: string }>(
  //       expand.word.expand?.['word_phonograms(word)']?.map(
  //         (phonogram: any) => phonogram.expand.phonogram

  //       )
  //     )

  //     const word = expand.word.word

  //     const wordId = expand.word.id

  //     const phonemeArrLength = plusOne.value ? phonemeArr.length + 1 : phonemeArr.length

  //     if (
  //       phonemeArr.every((phoneme) => phonemes.has(phoneme)) &&
  //       phonemes.size === phonemeArrLength
  //     ) {

  //       dictionary.value.set(word, { wordId, phonemes, phonograms })

  //     }
  //   })

  //   return result
  // }

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
        result.items.forEach(({ word, expand, id }) => {
          const phonemes = expand?.['word_phonemes(word)']?.map((phoneme) => phoneme.expand.phoneme)
          const phonograms = expand?.['word_phonograms(word)']?.map(
            (phonogram) => phonogram.expand.phonogram
          )
          dictionary.value.set(word, {
            wordId: id,
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
        result.items.forEach(({ expand, id }) => {
          if (!expand?.word) return

          const phonemes = expand.word.expand['word_phonemes(word)']?.map(
            (phoneme: any) => phoneme.expand.phoneme.phoneme
          )
          const phonograms = new Set<{ id: string; phonogram: string }>(
            expand.word.expand?.['word_phonograms(word)']?.map(
              (phonogram: any) => phonogram.expand.phonogram
            )
          )

          const word = expand.word.word
          dictionary.value.set(word, {
            wordId: id,
            phonemes: new Set(phonemes),
            phonograms
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
        result.items.forEach(({ expand, id }) => {
          if (!expand?.word) return

          const phonemes = expand.word.expand['word_phonemes(word)']?.map(
            (phoneme: any) => phoneme.expand.phoneme.phoneme
          )
          const phonograms = new Set<{ id: string; phonogram: string }>(
            expand.word.expand?.['word_phonograms(word)']?.map(
              (phonogram: any) => phonogram.expand.phonogram
            )
          )

          const word = expand.word.word
          dictionary.value.set(word, {
            wordId: id,
            phonemes: new Set(phonemes),
            phonograms
          })
        })
        return
      }
    } catch (error) {
      console.error('Error searching dictionary:', error)
      throw error
    }
  }

  // Generic delete from db function
  const _delete = async (collection: string, id: string, message: string) => {
    try {
      const res = await pb.collection(collection).delete(id)
      if (res === true) {
        console.log(`✅ Successfully deleted ${message}`)
        return true
      }
    } catch (error) {
      console.error(`❌ Error deleting ${message}: ${error}`)
      throw error
    }
  }

  // Remove tag from word
  const removeTagFromWord = async (
    word: string,
    wordId: string,
    tag: { id: string; tag: string },
    isPhoneme: boolean
  ) => {
    const entry = dictionary.value.get(word)
    if (!entry) return
    const type = isPhoneme ? 'phonemes' : 'phonograms'
    const collection = isPhoneme ? 'word_phonemes' : 'word_phonograms'

    const res = await pb.collection(collection).getFullList({
      filter: `word="${wordId}" && ${isPhoneme ? 'phoneme' : 'phonogram'}="${tag.id}"`
    })
    try {
      await _delete(collection, res[0].id, `Removed ${tag.tag} from ${word}`)
    } catch (error) {
      throw new Error(`❌ Error removing ${tag.tag} from ${word}`)
    }

    entry[type].forEach((value) => {
      if (value.id === tag.id) {
        if (isPhoneme) {
          const phonemeTag = value as { id: string; phoneme: string }
          entry.phonemes.delete(phonemeTag)
        } else {
          const phonogramTag = value as { id: string; phonogram: string }
          entry.phonograms.delete(phonogramTag)
        }
      }
    })
  }

  const addTagToWord = async (
    word: string,
    wordId: string,
    tag: { id: string; tag: string },
    isPhoneme: boolean
  ) => {
    const entry = dictionary.value.get(word)
    if (!entry) return
    const type = isPhoneme ? 'phonemes' : 'phonograms'
    const collection = isPhoneme ? 'word_phonemes' : 'word_phonograms'

    // Being lazy with types
    if (entry[type].has(tag as any)) return
    entry[type].add(tag as any)

    try {
      await pb.collection(collection).create({
        word: wordId,
        [isPhoneme ? 'phoneme' : 'phonogram']: tag.id
      })
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  return {
    getDictionaryPage,
    searchDictionary,
    removeTagFromWord,
    addTagToWord,
    fetchAllPhonemes,
    fetchAllPhonograms
  }
}
