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

export interface IStudentPhoneme {
  id: string
  phoneme: string
  phoneme_id: string
  date_added: string
}

export interface IStudentPhonogram {
  id: string
  phonogram: string
  phonogram_id: string
  date_added: string
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export function useStudentService() {
  const studentStore = useStudentStore()
  const { students, loading, loaded, error } = storeToRefs(studentStore)

  const createStudent = async (name: string) => {
    const uniqueId = uuid()
    try {
      if (pb.authStore.isAdmin) {
        throw new UnauthorizedError('Only Teachers can create students')
      }
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
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err
      }
      error.value = err.message || 'Failed to create student'
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
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch students'
      throw new Error('Failed to fetch students')
    } finally {
      loading.value = false
    }
  }

  const fetchStudent = async (id: string) => {
    try {
      const res = await pb.collection('students').getOne(id)
      return res
    } catch (err: any) {
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
    } catch (err: any) {
      error.value = err.message || 'Failed to update student'
      throw new Error('Failed to update student')
    } finally {
      loading.value = false
    }
  }

  const deleteStudent = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const hasAccess = await checkTeacherAccess(id)
      if (!hasAccess) {
        throw new UnauthorizedError('Unauthorized access to student dictionary')
      }

      const teacher_students_id = await pb
        .collection('teacher_students')
        .getFirstListItem(`student_id = "${id}"`)
      const res = await pb.collection('teacher_students').delete(teacher_students_id.id)

      students.value = students.value.filter((s) => s.id !== id)

      return res
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err
      }
      throw new Error('Failed to delete student')
    } finally {
      loading.value = false
    }
  }

  const checkTeacherAccess = async (studentId: string) => {
    try {
      const res = await pb
        .collection('teacher_students')
        .getFirstListItem(
          `teacher_id = "${pb.authStore.model?.id}" && student_id = "${studentId}"`,
          { requestKey: uuid() }
        )
      return !!res
    } catch (err: any) {
      return false
    }
  }

  // Get all words for a specific student
  const fetchStudentWords = async (studentId: string) => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new UnauthorizedError('Unauthorized access to student dictionary')
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
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err
      }
      throw new Error('Failed to fetch student words')
    }
  }

  // Add a word to student's dictionary
  const addWordToStudent = async (studentId: string, wordId: string, notes: string = '') => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new UnauthorizedError('Unauthorized access to student dictionary')
      }

      try {
        await pb.collection('student_words').getFirstListItem(`
          student_id = "${studentId}" && word_id = "${wordId}"
        `)
        throw new Error('Word already in student dictionary')
      } catch (err: any) {
        if (err.message !== 'Word already in student dictionary') {
          const res = await pb.collection('student_words').create({
            student_id: studentId,
            word_id: wordId,
            notes,
            mastery_level: 1
          })
          return res
        } else {
          throw err
        }
      }
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err
      }
      throw new Error(err.message || 'Failed to add word to student')
    }
  }

  const removeWordFromStudent = async (studentId: string, studentWordId: string) => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new UnauthorizedError('Unauthorized access to student dictionary')
      }

      const res = await pb.collection('student_words').delete(studentWordId)
      return res
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err
      }
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
        throw new UnauthorizedError('Unauthorized access to student dictionary')
      }

      const res = await pb.collection('student_words').update(studentWordId, data)
      return res
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err
      }
      throw new Error('Failed to update student word')
    }
  }

  // Get all phonemes for a specific student
  const fetchStudentPhonemes = async (studentId: string): Promise<IStudentPhoneme[]> => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new UnauthorizedError('Unauthorized access to student dictionary')
      }

      const res = await pb.collection('student_phonemes').getFullList({
        filter: `student_id = "${studentId}"`,
        sort: 'created',
        expand: 'phoneme_id'
      })

      return res.map((item: any) => ({
        id: item.id,
        phoneme: item.expand?.phoneme_id?.phoneme || '',
        phoneme_id: item.phoneme_id,
        date_added: new Date(item.created).toLocaleString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }))
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err
      }
      throw new Error('Failed to fetch student phonemes')
    }
  }

  // Get all phonograms for a specific student
  const fetchStudentPhonograms = async (studentId: string): Promise<IStudentPhonogram[]> => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new UnauthorizedError('Unauthorized access to student dictionary')
      }

      const res = await pb.collection('student_phonograms').getFullList({
        filter: `student_id = "${studentId}"`,
        sort: 'created',
        expand: 'phonogram_id'
      })

      return res.map((item: any) => ({
        id: item.id,
        phonogram: item.expand?.phonogram_id?.phonogram || '',
        phonogram_id: item.phonogram_id,
        date_added: new Date(item.created).toLocaleString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }))
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err
      }
      throw new Error('Failed to fetch student phonograms')
    }
  }

  // Add multiple phonemes to student
  const addPhonemesToStudent = async (studentId: string, phonemeIds: string[]) => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new UnauthorizedError('Unauthorized access to student dictionary')
      }

      // Check all phonemes in parallel to see which already exist
      const existenceChecks = await Promise.allSettled(
        phonemeIds.map((phonemeId) =>
          pb.collection('student_phonemes').getFirstListItem(`
            student_id = "${studentId}" && phoneme_id = "${phonemeId}"
          `)
        )
      )

      // Filter to only phonemes that don't exist (rejected promises)
      const phonemesToCreate = phonemeIds.filter(
        (_, index) => existenceChecks[index].status === 'rejected'
      )

      // Create all new phonemes in parallel
      if (phonemesToCreate.length > 0) {
        const results = await Promise.all(
          phonemesToCreate.map((phonemeId) =>
            pb.collection('student_phonemes').create({
              student_id: studentId,
              phoneme_id: phonemeId
            })
          )
        )
        return results
      }

      return []
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err
      }
      throw new Error('Failed to add phonemes to student')
    }
  }

  // Add multiple phonograms to student
  const addPhonogramsToStudent = async (studentId: string, phonogramIds: string[]) => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new UnauthorizedError('Unauthorized access to student dictionary')
      }

      // Check all phonograms in parallel to see which already exist
      const existenceChecks = await Promise.allSettled(
        phonogramIds.map((phonogramId) =>
          pb.collection('student_phonograms').getFirstListItem(`
            student_id = "${studentId}" && phonogram_id = "${phonogramId}"
          `)
        )
      )

      // Filter to only phonograms that don't exist (rejected promises)
      const phonogramsToCreate = phonogramIds.filter(
        (_, index) => existenceChecks[index].status === 'rejected'
      )

      // Create all new phonograms in parallel
      if (phonogramsToCreate.length > 0) {
        const results = await Promise.all(
          phonogramsToCreate.map((phonogramId) =>
            pb.collection('student_phonograms').create({
              student_id: studentId,
              phonogram_id: phonogramId
            })
          )
        )
        return results
      }

      return []
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err
      }
      throw new Error('Failed to add phonograms to student')
    }
  }

  // Remove phoneme from student
  const removePhonemeFromStudent = async (studentId: string, studentPhonemeId: string) => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new UnauthorizedError('Unauthorized access to student dictionary')
      }

      const res = await pb.collection('student_phonemes').delete(studentPhonemeId)
      return res
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err
      }
      throw new Error('Failed to remove phoneme from student')
    }
  }

  // Remove phonogram from student
  const removePhonogramFromStudent = async (studentId: string, studentPhonogramId: string) => {
    try {
      const hasAccess = await checkTeacherAccess(studentId)
      if (!hasAccess) {
        throw new UnauthorizedError('Unauthorized access to student dictionary')
      }

      const res = await pb.collection('student_phonograms').delete(studentPhonogramId)
      return res
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        throw err
      }
      throw new Error('Failed to remove phonogram from student')
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
    fetchStudentPhonemes,
    fetchStudentPhonograms,
    addPhonemesToStudent,
    addPhonogramsToStudent,
    removePhonemeFromStudent,
    removePhonogramFromStudent,
    checkTeacherAccess
  }
}
