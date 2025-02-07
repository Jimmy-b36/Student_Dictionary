import wordPhonogramList from '@/data/output.json'
import PocketBase from 'pocketbase'

const pb = new PocketBase('https://pocket.jaffs.org')

interface IPhonemeObj {
  collectionId: string
  collectionName: string
  created: string
  id: string
  phoneme: string
  updated: string
}

interface IPhonogramObj {
  collectionId: string
  collectionName: string
  created: string
  id: string
  phonogram: string
  updated: string
}

export const Factories = () => {
  const addWordsToDatabase = async () => {
    const wordsPhonograms = JSON.parse(JSON.stringify(wordPhonogramList))
    for (const item of wordsPhonograms) {
      const word = Object.keys(item)[0]
      await pb.collection('global_dictionary').create({
        word: word
      })
    }
  }

  const updateJunction = async () => {
    const wordsPhonograms = JSON.parse(JSON.stringify(wordPhonogramList))
    const fullPhonemes = await pb.collection('phonemes').getFullList()
    const fullPhonograms = await pb.collection('phonograms').getFullList()

    try {
      for (const word in wordsPhonograms) {
        const { phonemes, phonograms } = wordsPhonograms[word]

        const wordRecord = await pb
          .collection('global_dictionary')
          .getFirstListItem(`word="${encodeURIComponent(word)}"`)

        for (const phoneme of phonemes) {
          const phonemeId = fullPhonemes.find(
            (phonemeObj: any) => (phonemeObj as IPhonemeObj).phoneme === phoneme
          )?.id

          if (wordRecord && phonemeId) {
            await pb.collection('word_phonemes').create({
              word: wordRecord.id,
              phoneme: phonemeId
            })
          }
        }

        for (const phonogram of phonograms) {
          const phonogramId = fullPhonograms.find(
            (phonogramObj: any) => (phonogramObj as IPhonogramObj).phonogram === phonogram
          )?.id

          if (wordRecord && phonogramId) {
            await pb.collection('word_phonograms').create({
              word: wordRecord.id,
              phonogram: phonogramId
            })
          }
        }
      }
    } catch (error) {
      console.error('Error in updateJunction:', error)
    }
  }

  return {
    addWordsToDatabase,
    updateJunction
  }
}
