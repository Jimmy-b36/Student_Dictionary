import { storeToRefs } from 'pinia'
import { usePhonemesStore } from '../stores/phonemes'
import { pb } from '../utils/pocketbaseConnection'
export const usePhonemes = () => {
  const { phonemes } = storeToRefs(usePhonemesStore())
  const fetchAllPhonemes = async () => {
    const response = await pb.collection('phonemes').getFullList()
    phonemes.value = response.map((phonemeObj: any) => {
      return {
        id: phonemeObj.id,
        phoneme: phonemeObj.phoneme
      }
    })
  }

  return {
    fetchAllPhonemes
  }
}
