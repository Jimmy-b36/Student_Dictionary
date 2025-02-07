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

  // -------------------
  // Fetch functions
  // -------------------
  const getDictionaryPage = async (currentPage = 1, pageSize = 100) => {
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
          phonemes: new Set(phonemes ?? []),
          phonograms: new Set(phonograms ?? [])
        }

        dictionary.value.set(word, entry)

        if (currentPage === 1) {
          initialItemsCache.value.set(word, entry)
        }
      })
    } catch (error) {
      console.log('🥶 Error fetching dictionary page:', error)
      throw new Error('Failed to fetch dictionary page')
    }
  }

  const fetchAllPhonemes = async () => {
    if (phonemes.value.length > 0) return
    try {
      const response = await pb
        .collection('phonemes')
        .getFullList<{ id: string; phoneme: string }>()
      phonemes.value = response.map(({ id, phoneme }) => ({ id, phoneme }))
    } catch (error) {
      console.log('🥶 Error fetching phonemes:', error)
      throw new Error('Failed to fetch phonemes')
    }
  }

  const fetchAllPhonograms = async () => {
    if (phonograms.value.length > 0) return
    try {
      const response = await pb
        .collection('phonograms')
        .getFullList<{ id: string; phonogram: string }>()
      phonograms.value = response.map(({ id, phonogram }) => ({ id, phonogram }))
    } catch (error) {
      console.log('🥶 Error fetching phonograms:', error)
      throw new Error('Failed to fetch phonograms')
    }
  }

  // -------------------
  // Search functions
  // -------------------

  // TODO implement search
  const phonemeSearch = async (phonemeSearchArr: { id: string; phoneme: string }[]) => {
    if (phonemeSearchArr.length === 0) {
      // If no phonemes are selected, fetch all
      await getDictionaryPage(1, 100)
      return
    }

    dictionary.value.clear()

    const res = await pb.collection('word_phonemes').getFullList({
      filter: phonemeSearchArr
        .map((phoneme) => `phoneme.phoneme="${phoneme.phoneme}"`)
        .join(' || '),
      expand: 'word.word_phonemes(word).phoneme,word.word_phonograms(word).phonogram',
      fields:
        'expand.word.word,expand.word.expand.word_phonograms(word).expand.phonogram.phonogram,expand.word.expand.word_phonemes(word).expand.phoneme.phoneme,expand.word.expand.word_phonograms(word).expand.phonogram.id,expand.word.expand.word_phonemes(word).expand.phoneme.id'
    })

    res.forEach(({ expand }) => {
      if (!expand?.word) return

      const phonemes = new Set<{ id: string; phoneme: string }>(
        expand.word.expand['word_phonemes(word)']?.map((phoneme: any) => phoneme.expand.phoneme)
      )

      const phonograms = new Set<{ id: string; phonogram: string }>(
        expand.word.expand?.['word_phonograms(word)']?.map(
          (phonogram: any) => phonogram.expand.phonogram
        )
      )

      const word = expand.word.word
      const wordId = expand.word.id

      // Only add words that have exactly the phonemes we're looking for
      if (phonemes.size <= phonemeSearchArr.length) {
        const hasAllPhonemes = [...phonemes].every((p) =>
          phonemeSearchArr.some((searchP) => searchP.phoneme === p.phoneme)
        )
        if (hasAllPhonemes) {
          dictionary.value.set(word, { wordId, phonemes, phonograms })
        }
      }
    })

    return res
  }

  const phonogramSearch = async (phonogramSearchArr: { id: string; phonogram: string }[]) => {
    if (phonogramSearchArr.length === 0) {
      // If no phonograms are selected, fetch all
      await getDictionaryPage(1, 100)
      return
    }

    dictionary.value.clear()

    const res = await pb.collection('word_phonograms').getFullList({
      filter: phonogramSearchArr
        .map((phonogram) => `phonogram.phonogram="${phonogram.phonogram}"`)
        .join(' || '),
      expand: 'word.word_phonemes(word).phoneme,word.word_phonograms(word).phonogram',
      fields:
        'expand.word.word,expand.word.expand.word_phonograms(word).expand.phonogram.phonogram,expand.word.expand.word_phonemes(word).expand.phoneme.phoneme,expand.word.expand.word_phonograms(word).expand.phonogram.id,expand.word.expand.word_phonemes(word).expand.phoneme.id'
    })

    res.forEach(({ expand }) => {
      if (!expand?.word) return

      const phonemes = new Set<{ id: string; phoneme: string }>(
        expand.word.expand['word_phonemes(word)']?.map((phoneme: any) => phoneme.expand.phoneme)
      )

      const phonograms = new Set<{ id: string; phonogram: string }>(
        expand.word.expand?.['word_phonograms(word)']?.map(
          (phonogram: any) => phonogram.expand.phonogram
        )
      )

      const word = expand.word.word
      const wordId = expand.word.id

      // Only add words that have exactly the phonograms we're looking for
      if (phonograms.size <= phonogramSearchArr.length) {
        const hasAllPhonograms = [...phonograms].every((p) =>
          phonogramSearchArr.some((searchP) => searchP.phonogram === p.phonogram)
        )
        if (hasAllPhonograms) {
          dictionary.value.set(word, { wordId, phonemes, phonograms })
        }
      }

      return res
    })
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

    try {
      // Word search
      const result = await pb.collection('global_dictionary').getList<IDictionaryResponse>(1, 30, {
        filter: `word~"${searchParam}"`,
        expand: 'word_phonograms(word).phonogram,word_phonemes(word).phoneme',
        fields:
          'id, word,expand.word_phonograms(word).expand.phonogram,expand.word_phonemes(word).expand.phoneme'
      })

      if (result.items.length) {
        result.items.forEach(({ word, expand, id }) => {
          const phonemes = expand?.['word_phonemes(word)']?.map((phoneme) => phoneme.expand.phoneme)
          const phonograms = expand?.['word_phonograms(word)']?.map(
            (phonogram) => phonogram.expand.phonogram
          )
          dictionary.value.set(word, {
            wordId: id,
            phonemes: new Set(phonemes ?? []),
            phonograms: new Set(phonograms ?? [])
          })
        })
        return
      }
    } catch (error) {
      console.log('🥶 Error searching dictionary:', error)
      throw new Error('Failed to search dictionary')
    }
  }

  // -------------------
  // Delete/Add functions
  // -------------------

  // Generic delete from db function
  const _delete = async (collection: string, id: string, message: string): Promise<boolean> => {
    try {
      const res = await pb.collection(collection).delete(id)
      if (res === true) {
        console.log('🥶 Successfully deleted', message)
        return true
      }
      return false
    } catch (error) {
      console.log('🥶 Error deleting', message, error)
      throw new Error(`Failed to delete ${message}`)
    }
  }

  type Tag = { id: string; [key: string]: string }

  // Remove tag from word
  const removeTagFromWord = async (
    word: string,
    wordId: string,
    tag: Tag,
    isPhoneme: boolean
  ): Promise<void> => {
    const entry = dictionary.value.get(word)
    if (!entry) return

    const type = isPhoneme ? 'phonemes' : 'phonograms'
    const collection = isPhoneme ? 'word_phonemes' : 'word_phonograms'

    try {
      const res = await pb.collection(collection).getFullList({
        filter: `word="${wordId}" && ${isPhoneme ? 'phoneme' : 'phonogram'}="${tag.id}"`
      })

      if (res.length > 0) {
        await _delete(collection, res[0].id, `${tag.tag} from ${word}`)
      }

      entry[type].forEach((value: { id: string; [key: string]: string }) => {
        if (value.id === tag.id) {
          if (isPhoneme) {
            entry.phonemes.delete(value as { id: string; phoneme: string })
          } else {
            entry.phonograms.delete(value as { id: string; phonogram: string })
          }
        }
      })
    } catch (error) {
      console.log('🥶 Error removing tag:', error)
      throw new Error(`Failed to remove ${tag.tag} from ${word}`)
    }
  }

  const addTagToWord = async (
    word: string,
    wordId: string,
    tag: Tag,
    isPhoneme: boolean
  ): Promise<{ type: 'error' | 'success'; message: string }> => {
    const entry = dictionary.value.get(word)

    if (!entry) return { type: 'error', message: 'Word not found' }

    const type = isPhoneme ? 'phonemes' : 'phonograms'
    const collection = isPhoneme ? 'word_phonemes' : 'word_phonograms'
    const tagKey = isPhoneme ? 'phoneme' : 'phonogram'

    const tagWithCorrectKey = {
      id: tag.id,
      [tagKey]: tag[tagKey]
    }

    let hasTag = false
    entry[type].forEach((value: { id: string; [key: string]: string }) => {
      if (value.id === tagWithCorrectKey.id) hasTag = true
    })

    if (hasTag) {
      return {
        type: 'error',
        message: `Failed to add ${tag[tagKey]} to ${word}, it already exists`
      }
    }

    // Type stuff
    if (isPhoneme) entry.phonemes.add(tagWithCorrectKey as { id: string; phoneme: string })
    else entry.phonograms.add(tagWithCorrectKey as { id: string; phonogram: string })
    try {
      pb.autoCancellation(false)
      await pb.collection(collection).create({
        word: wordId,
        [tagKey]: tag.id
      })
      pb.autoCancellation(true)
      return {
        type: 'success',
        message: `Successfully added ${tag[tagKey]} to ${word}`
      }
    } catch (error: any) {
      console.error('Error adding tag:', error.message)
      throw new Error(error.message)
    }
  }

  return {
    getDictionaryPage,
    searchDictionary,
    removeTagFromWord,
    addTagToWord,
    fetchAllPhonemes,
    fetchAllPhonograms,
    phonemeSearch,
    phonogramSearch
  }
}
