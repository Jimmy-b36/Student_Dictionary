import PocketBase from 'pocketbase'
import wordPhonogramList from '../data/wordPhonogramList.json'

const pb = new PocketBase('https://pocket.jaffs.org')

interface IPhonemeObj {
  collectionId: string
  collectionName: string
  created: string
  id: string
  phoneme: string
  updated: string
}

export const Factories = () => {
  const login = async () => {
    const authData = await pb.admins.authWithPassword(
      import.meta.env.VITE_POCKETBASE_EMAIL,
      import.meta.env.VITE_POCKETBASE_PASSWORD
    )
    return authData
  }

  const addWordsToDatabase = async () => {
    let wordsPhonograms = JSON.parse(JSON.stringify(wordPhonogramList))
    for (let item of wordsPhonograms) {
      const word = Object.keys(item)[0]
      await pb.collection('global_dictionary').create({
        word: word
      })
    }
  }

  const updateJunction = async () => {
    const wordsPhonograms = JSON.parse(JSON.stringify(wordPhonogramList))
    const fullPhonemes = await pb.collection('phonemes').getFullList()

    try {
      for (const item of wordsPhonograms) {
        const word = Object.keys(item)[0]
        const { phonemes } = item[word]

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
      }
    } catch (error) {
      console.error('Error in updateJunction:', error)
    }
  }

  return {
    login,
    addWordsToDatabase,
    updateJunction,
    printPhonemes
  }
}
