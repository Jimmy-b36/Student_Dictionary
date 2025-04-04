// Create Student
//    - Needs a dict linked to them
// Fetch Student
// Update Student
// Delete Student
//    - Cascade delete dict

import { pb } from '@/utils/pocketbaseConnection'
import { storeToRefs } from 'pinia'
import { v4 as uuid } from 'uuid'
import { useStudentStore } from '../stores/student.store'

export interface IStudent {
  id: string
  display_name: string
  unique_id: string
  created: string
}

export interface IStudentWord {
  id: string
  word: string
  phonemes: { id: string; phoneme: string }[]
  phonograms: { id: string; phonogram: string }[]
  notes: string
  mastery_level: number
  date_added: string
  word_id: string
}

export function useStudentService() {
  const studentStore = useStudentStore()
  const { students, loading, loaded, error } = storeToRefs(studentStore)

  const createStudent = async (name: string) => {
    const uniqueId = uuid()
    try {
      loading.value = true
      error.value = null

      const res = await pb.collection('students').create({
        display_name: name,
        unique_id: `${name}-${uniqueId.split('-')[2]}`
      })
      await pb.collection('teacher_students').create({
        teacher_id: pb.authStore.model?.id,
        student_id: res.id
      })

      const formattedStudent: IStudent = {
        id: res.id,
        display_name: res.display_name,
        unique_id: res.unique_id,
        created: new Date(res.created).toLocaleString()
      }

      students.value.push(formattedStudent)
      return res
    } catch (error: any) {
      console.log('🥶 Error creating student:', error)
      error.value = error.message || 'Failed to create student'
      throw new Error('Failed to create student')
    } finally {
      loading.value = false
    }
  }

  const fetchStudents = async (forceRefresh = false) => {
    if (loaded.value && students.value.length > 0 && !forceRefresh) {
      return students.value
    }

    try {
      loading.value = true
      error.value = null

      const res = await pb.collection('teacher_students').getFullList({
        filter: `teacher_id = "${pb.authStore.model?.id}"`,
        sort: 'created',
        expand: 'student_id'
      })

      const formattedStudents = res.map((student) => ({
        id: student.expand?.student_id?.id,
        display_name: student.expand?.student_id?.display_name,
        unique_id: student.expand?.student_id?.unique_id,
        created: new Date(student.created).toLocaleString()
      }))

      students.value = formattedStudents
      loaded.value = true

      return formattedStudents
    } catch (error: any) {
      error.value = error.message || 'Failed to fetch students'
      throw new Error('Failed to fetch students')
    } finally {
      loading.value = false
    }
  }

  const fetchStudent = async (id: string) => {
    try {
      const res = await pb.collection('students').getOne(id)
      return res
    } catch (error: any) {
      throw new Error('Failed to fetch student')
    }
  }

  const updateStudent = async (id: string, name: string) => {
    try {
      loading.value = true
      error.value = null

      const res = await pb.collection('students').update(id, { display_name: name })

      const formattedStudent = {
        id: res.id,
        display_name: res.display_name,
        unique_id: res.unique_id,
        created: new Date(res.created).toLocaleString()
      }

      const index = students.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        students.value[index] = formattedStudent
      }

      return res
    } catch (error: any) {
      error.value = error.message || 'Failed to update student'
      throw new Error('Failed to update student')
    } finally {
      loading.value = false
    }
  }

  const deleteStudent = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const res = await pb.collection('students').delete(id)

      students.value = students.value.filter((s) => s.id !== id)

      return res
    } catch (error: any) {
      error.value = error.message || 'Failed to delete student'
      throw new Error('Failed to delete student')
    } finally {
      loading.value = false
    }
  }

  // Only teachers who created the student can access it
  const checkTeacherAccess = async (studentId: string) => {
    try {
      const res = await pb.collection('teacher_students').getFirstListItem(`
        teacher_id = "${pb.authStore.model?.id}" && student_id = "${studentId}"
      `)
      return !!res
    } catch (error: any) {
      return false
    }
  }

  // Get all words for a specific student
  const fetchStudentWords = async (studentId: string) => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new Error('Unauthorized access to student dictionary')
      }

      const res = await pb.collection('student_words').getFullList({
        filter: `student_id.id = "${studentId}"`,
        sort: 'created',
        expand: 'word_id.word_phonemes(word).phoneme,word_id.word_phonograms(word).phonogram'
      })

      return res.map((item: any) => ({
        id: item.id,
        word: item.expand?.word_id?.word || '',
        phonemes:
          item.expand?.word_id?.expand['word_phonemes(word)']?.map((p: any) => ({
            id: p.expand.phoneme.id,
            phoneme: p.expand.phoneme.phoneme
          })) || [],
        phonograms:
          item.expand?.word_id?.expand['word_phonograms(word)']?.map((p: any) => ({
            id: p.expand.phonogram.id,
            phonogram: p.expand.phonogram.phonogram
          })) || [],
        notes: item.notes || '',
        mastery_level: item.mastery_level || 1,
        date_added: new Date(item.created).toLocaleString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        word_id: item.word_id
      }))
    } catch (error: any) {
      throw new Error('Failed to fetch student words')
    }
  }

  // Add a word to student's dictionary
  const addWordToStudent = async (studentId: string, wordId: string, notes: string = '') => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new Error('Unauthorized access to student dictionary')
      }

      try {
        await pb.collection('student_words').getFirstListItem(`
          student_id = "${studentId}" && word_id = "${wordId}"
        `)
        throw new Error('Word already in student dictionary')
      } catch (error: any) {
        if (error.message !== 'Word already in student dictionary') {
          const res = await pb.collection('student_words').create({
            student_id: studentId,
            word_id: wordId,
            notes,
            mastery_level: 1
          })
          return res
        } else {
          throw error
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add word to student')
    }
  }

  const removeWordFromStudent = async (studentId: string, studentWordId: string) => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new Error('Unauthorized access to student dictionary')
      }

      const res = await pb.collection('student_words').delete(studentWordId)
      return res
    } catch (error: any) {
      throw new Error('Failed to remove word from student')
    }
  }

  const updateStudentWord = async (
    studentId: string,
    studentWordId: string,
    data: { notes?: string; mastery_level?: number }
  ) => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new Error('Unauthorized access to student dictionary')
      }

      const res = await pb.collection('student_words').update(studentWordId, data)
      return res
    } catch (error: any) {
      throw new Error('Failed to update student word')
    }
  }

  return {
    createStudent,
    fetchStudent,
    fetchStudents,
    updateStudent,
    deleteStudent,
    fetchStudentWords,
    addWordToStudent,
    removeWordFromStudent,
    updateStudentWord,
    checkTeacherAccess
  }
}
