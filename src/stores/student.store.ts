import { type IStudent } from '@/composables/student.service'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStudentStore = defineStore('student', () => {
  const students = ref<IStudent[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const getStudentById = (studentId: string) => {
    return students.value.find((s: IStudent) => s.id === studentId)
  }
  const resetStore = () => {
    students.value = []
    loaded.value = false
    loading.value = false
    error.value = null
  }

  return {
    students,
    loading,
    loaded,
    error,
    getStudentById,
    resetStore
  }
})
