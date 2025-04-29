import { useStudentStore } from '@/stores/student.store'
import { pb } from '@/utils/pocketbaseConnection'
import { createPinia, setActivePinia } from 'pinia'
import { v4 as uuid } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useStudentService } from '../student.service'

// Mock uuid to return consistent values for testing
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-value-123')
}))

// Create dedicated spies for PocketBase calls
const pbCreateSpy = vi.fn()
const pbUpdateSpy = vi.fn()
const pbDeleteSpy = vi.fn()
const pbGetOneSpy = vi.fn()
const pbGetFullListSpy = vi.fn()
const pbGetFirstListItemSpy = vi.fn()

// Mock PocketBase
vi.mock('@/utils/pocketbaseConnection', () => ({
  pb: {
    collection: vi.fn(() => ({
      create: pbCreateSpy,
      update: pbUpdateSpy,
      delete: pbDeleteSpy,
      getOne: pbGetOneSpy,
      getFullList: pbGetFullListSpy,
      getFirstListItem: pbGetFirstListItemSpy
    })),
    authStore: {
      model: {
        id: 'teacher-123'
      }
    }
  }
}))

describe('Student Service', () => {
  let studentService: ReturnType<typeof useStudentService>
  let studentStore: ReturnType<typeof useStudentStore>

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create a fresh pinia instance for each test
    const pinia = createPinia()
    setActivePinia(pinia)

    // Initialize store
    studentStore = useStudentStore()

    // Set initial values
    studentStore.students = []
    studentStore.loading = false
    studentStore.loaded = false
    studentStore.error = null

    // Initialize the service
    studentService = useStudentService()
  })

  describe('createStudent', () => {
    it('should create a new student', async () => {
      // Mock responses
      pbCreateSpy.mockImplementation((collectionName, data) => {
        if (collectionName === 'students') {
          return {
            id: 'student-123',
            display_name: 'Test Student',
            unique_id: 'Test Student-123',
            created: '2023-01-01T00:00:00.000Z'
          }
        }
        return {
          id: 'teacher-student-123',
          display_name: 'Test Student',
          unique_id: 'Test Student-123'
        }
      })

      const result = await studentService.createStudent('Test Student')

      // Check both calls were made
      expect(pb.collection).toHaveBeenCalledWith('students')

      expect(pb.collection).toHaveBeenCalledWith('teacher_students')
      expect(pbCreateSpy).toHaveBeenCalledTimes(2)

      // Check the first call arguments (student creation)
      expect(pbCreateSpy.mock.calls[0][0]).toEqual({
        display_name: 'Test Student',
        unique_id: 'Test Student-value'
      })

      // Check the second call arguments (teacher-student relationship)
      expect(pbCreateSpy.mock.calls[1][0]).toEqual({
        teacher_id: 'teacher-123',
        student_id: 'teacher-student-123'
      })

      // Check store was updated
      expect(studentStore.students.length).toBe(1)
      expect(studentStore.students[0].id).toBe('teacher-student-123')
      expect(studentStore.students[0].display_name).toBe('Test Student')

      // Check result
      expect(result.id).toBe('teacher-student-123')
    })

    it('should set error state when student creation fails', async () => {
      pbCreateSpy.mockRejectedValueOnce(new Error('Network error'))

      await expect(studentService.createStudent('Test Student')).rejects.toThrow(
        'Failed to create student'
      )

      expect(studentStore.error).not.toBeNull()
      expect(studentStore.loading).toBe(false)
    })
  })

  describe('fetchStudents', () => {
    it('should return cached students if already loaded', async () => {
      // Set up store with already loaded students
      studentStore.students = [
        {
          id: 'student-123',
          display_name: 'Test Student',
          unique_id: 'test-123',
          created: '1/1/2023'
        }
      ]
      studentStore.loaded = true

      const result = await studentService.fetchStudents()

      // Check that no API calls were made
      expect(pbGetFullListSpy).not.toHaveBeenCalled()

      // Should return the stored students
      expect(result).toEqual(studentStore.students)
    })

    it('should fetch students from API when not loaded', async () => {
      pbGetFullListSpy.mockResolvedValueOnce([
        {
          id: 'relation-123',
          created: '2023-01-01T00:00:00.000Z',
          expand: {
            student_id: {
              id: 'student-123',
              display_name: 'Test Student',
              unique_id: 'test-123'
            }
          }
        }
      ])

      const result = await studentService.fetchStudents()

      // Verify API call
      expect(pb.collection).toHaveBeenCalledWith('teacher_students')
      expect(pbGetFullListSpy).toHaveBeenCalledWith({
        filter: `teacher_id = "teacher-123"`,
        sort: 'created',
        expand: 'student_id'
      })

      // Check store was updated
      expect(studentStore.students.length).toBe(1)
      expect(studentStore.students[0].id).toBe('student-123')
      expect(studentStore.loaded).toBe(true)

      // Check return value
      expect(result[0].id).toBe('student-123')
      expect(result[0].display_name).toBe('Test Student')
    })

    it('should handle errors when fetching students', async () => {
      pbGetFullListSpy.mockRejectedValueOnce(new Error('Network error'))

      await expect(studentService.fetchStudents()).rejects.toThrow('Failed to fetch students')

      expect(studentStore.error).not.toBeNull()
      expect(studentStore.loading).toBe(false)
    })

    it('should force refresh when specified', async () => {
      // Set up store with already loaded students
      studentStore.students = [
        {
          id: 'student-123',
          display_name: 'Test Student',
          unique_id: 'test-123',
          created: '1/1/2023'
        }
      ]
      studentStore.loaded = true

      pbGetFullListSpy.mockResolvedValueOnce([
        {
          id: 'relation-456',
          created: '2023-01-01T00:00:00.000Z',
          expand: {
            student_id: {
              id: 'student-456',
              display_name: 'New Student',
              unique_id: 'new-456'
            }
          }
        }
      ])

      const result = await studentService.fetchStudents(true)

      // Verify API call was made despite having loaded data
      expect(pbGetFullListSpy).toHaveBeenCalled()

      // Check store was updated with new data
      expect(studentStore.students.length).toBe(1)
      expect(studentStore.students[0].id).toBe('student-456')
    })
  })

  describe('fetchStudent', () => {
    it('should fetch a single student by id', async () => {
      const mockStudent = {
        id: 'student-123',
        display_name: 'Test Student',
        unique_id: 'test-123'
      }

      pbGetOneSpy.mockResolvedValueOnce(mockStudent)

      const result = await studentService.fetchStudent('student-123')

      expect(pb.collection).toHaveBeenCalledWith('students')
      expect(pbGetOneSpy).toHaveBeenCalledWith('student-123')
      expect(result).toEqual(mockStudent)
    })

    it('should handle errors when fetching a student', async () => {
      pbGetOneSpy.mockRejectedValueOnce(new Error('Not found'))

      await expect(studentService.fetchStudent('invalid-id')).rejects.toThrow(
        'Failed to fetch student'
      )
    })
  })

  describe('updateStudent', () => {
    it('should update a student', async () => {
      // Set up store with existing students
      studentStore.students = [
        { id: 'student-123', display_name: 'Old Name', unique_id: 'test-123', created: '1/1/2023' }
      ]

      const updatedStudent = {
        id: 'student-123',
        display_name: 'New Name',
        unique_id: 'test-123',
        created: '2023-01-01T00:00:00.000Z'
      }

      pbUpdateSpy.mockResolvedValueOnce(updatedStudent)

      const result = await studentService.updateStudent('student-123', 'New Name')

      expect(pb.collection).toHaveBeenCalledWith('students')
      expect(pbUpdateSpy).toHaveBeenCalledWith('student-123', { display_name: 'New Name' })

      // Check store was updated
      expect(studentStore.students[0].display_name).toBe('New Name')

      // Check result
      expect(result).toEqual(updatedStudent)
    })

    it('should handle errors when updating a student', async () => {
      pbUpdateSpy.mockRejectedValueOnce(new Error('Update failed'))

      await expect(studentService.updateStudent('student-123', 'New Name')).rejects.toThrow(
        'Failed to update student'
      )

      expect(studentStore.error).not.toBeNull()
      expect(studentStore.loading).toBe(false)
    })
  })

  describe('deleteStudent', () => {
    beforeEach(() => {
      // Set up store with existing students
      studentStore.students = [
        {
          id: 'student-123',
          display_name: 'Test Student',
          unique_id: 'test-123',
          created: '1/1/2023'
        },
        {
          id: 'student-456',
          display_name: 'Another Student',
          unique_id: 'test-456',
          created: '1/1/2023'
        }
      ]
    })

    it('should delete a student', async () => {
      // Mock access check success
      pbGetFirstListItemSpy.mockImplementation((filter) => {
        if (filter.includes('teacher_id')) {
          return { id: 'relation-123' }
        }
        return { id: 'teacher-student-123' }
      })

      pbDeleteSpy.mockResolvedValueOnce(true)

      const result = await studentService.deleteStudent('student-123')

      // Check access was verified
      expect(pbGetFirstListItemSpy).toHaveBeenCalledWith(
        expect.stringContaining('teacher_id = "teacher-123"')
      )

      // Check teacher_student relation was fetched
      expect(pbGetFirstListItemSpy).toHaveBeenCalledWith(
        expect.stringContaining('student_id = "student-123"')
      )

      // Check deletion was called
      expect(pbDeleteSpy).toHaveBeenCalledWith('teacher-student-123')

      // Check store was updated
      expect(studentStore.students.length).toBe(1)
      expect(studentStore.students[0].id).toBe('student-456')

      // Check result
      expect(result).toBe(true)
    })

    it('should throw error when user lacks access to delete student', async () => {
      // Mock access check failure
      pbGetFirstListItemSpy.mockRejectedValueOnce(new Error('No access'))

      await expect(studentService.deleteStudent('student-123')).rejects.toThrow(
        'Unauthorized access to student dictionary'
      )

      // Student list should remain unchanged
      expect(studentStore.students.length).toBe(2)
    })
  })

  describe('checkTeacherAccess', () => {
    it('should return true when teacher has access to student', async () => {
      pbGetFirstListItemSpy.mockResolvedValueOnce({ id: 'relation-123' })

      const result = await studentService.checkTeacherAccess('student-123')

      expect(pbGetFirstListItemSpy).toHaveBeenCalledWith(
        expect.stringContaining('teacher_id = "teacher-123"')
      )
      expect(pbGetFirstListItemSpy).toHaveBeenCalledWith(
        expect.stringContaining('student_id = "student-123"')
      )
      expect(result).toBe(true)
    })

    it('should return false when teacher does not have access', async () => {
      pbGetFirstListItemSpy.mockRejectedValueOnce(new Error('Not found'))

      const result = await studentService.checkTeacherAccess('student-123')

      expect(result).toBe(false)
    })
  })

  describe('fetchStudentWords', () => {
    it('should fetch words for a student', async () => {
      // Mock access check success
      pbGetFirstListItemSpy.mockResolvedValueOnce({ id: 'relation-123' })

      // Mock words response
      pbGetFullListSpy.mockResolvedValueOnce([
        {
          id: 'student-word-123',
          created: '2023-01-01T00:00:00.000Z',
          word_id: 'word-123',
          notes: 'Test notes',
          mastery_level: 2,
          expand: {
            word_id: {
              word: 'cat',
              expand: {
                'word_phonemes(word)': [
                  {
                    expand: {
                      phoneme: { id: 'phoneme-1', phoneme: 'k' }
                    }
                  },
                  {
                    expand: {
                      phoneme: { id: 'phoneme-2', phoneme: 'æ' }
                    }
                  }
                ],
                'word_phonograms(word)': [
                  {
                    expand: {
                      phonogram: { id: 'phonogram-1', phonogram: 'at' }
                    }
                  }
                ]
              }
            }
          }
        }
      ])

      const result = await studentService.fetchStudentWords('student-123')

      // Check access verification
      expect(pbGetFirstListItemSpy).toHaveBeenCalled()

      // Check words were fetched
      expect(pbGetFullListSpy).toHaveBeenCalledWith({
        filter: 'student_id.id = "student-123"',
        sort: 'created',
        expand: 'word_id.word_phonemes(word).phoneme,word_id.word_phonograms(word).phonogram'
      })

      // Check formatting
      expect(result.length).toBe(1)
      expect(result[0].word).toBe('cat')
      expect(result[0].phonemes.length).toBe(2)
      expect(result[0].phonograms.length).toBe(1)
      expect(result[0].notes).toBe('Test notes')
      expect(result[0].mastery_level).toBe(2)
    })

    it('should throw error when user lacks access', async () => {
      // Mock access check failure
      pbGetFirstListItemSpy.mockResolvedValueOnce(null)

      await expect(studentService.fetchStudentWords('student-123')).rejects.toThrow(
        'Unauthorized access to student dictionary'
      )
    })
  })

  describe('addWordToStudent', () => {
    it('should add a word to student dictionary', async () => {
      // Mock access check success
      pbGetFirstListItemSpy.mockImplementationOnce(() => Promise.resolve({ id: 'relation-123' }))

      // Mock word not already existing
      pbGetFirstListItemSpy.mockImplementationOnce(() => Promise.reject(new Error('Not found')))

      // Mock word creation success
      const mockCreatedWord = { id: 'student-word-123' }
      pbCreateSpy.mockResolvedValueOnce(mockCreatedWord)

      const result = await studentService.addWordToStudent('student-123', 'word-123', 'Test notes')

      // Check access was verified
      expect(pbGetFirstListItemSpy).toHaveBeenCalledWith(
        expect.stringContaining('teacher_id = "teacher-123"')
      )

      // Check duplicate check was made
      expect(pbGetFirstListItemSpy).toHaveBeenCalledWith(
        expect.stringContaining('student_id = "student-123"')
      )
      expect(pbGetFirstListItemSpy).toHaveBeenCalledWith(
        expect.stringContaining('word_id = "word-123"')
      )

      // Check word was created
      expect(pbCreateSpy).toHaveBeenCalledWith({
        student_id: 'student-123',
        word_id: 'word-123',
        notes: 'Test notes',
        mastery_level: 1
      })

      expect(result).toEqual(mockCreatedWord)
    })

    it('should throw error if word already exists', async () => {
      // Mock access check success
      pbGetFirstListItemSpy.mockImplementationOnce(() => Promise.resolve({ id: 'relation-123' }))

      // Mock word already existing
      pbGetFirstListItemSpy.mockImplementationOnce(() =>
        Promise.resolve({ id: 'student-word-123' })
      )

      await expect(studentService.addWordToStudent('student-123', 'word-123')).rejects.toThrow(
        'Word already in student dictionary'
      )
    })

    it('should throw error when user lacks access', async () => {
      // Mock access check failure
      pbGetFirstListItemSpy.mockRejectedValueOnce(new Error('No access'))

      await expect(studentService.addWordToStudent('student-123', 'word-123')).rejects.toThrow(
        'Unauthorized access to student dictionary'
      )
    })
  })

  describe('removeWordFromStudent', () => {
    it('should remove a word from student dictionary', async () => {
      // Mock access check success
      pbGetFirstListItemSpy.mockResolvedValueOnce({ id: 'relation-123' })

      // Mock delete success
      pbDeleteSpy.mockResolvedValueOnce(true)

      const result = await studentService.removeWordFromStudent('student-123', 'student-word-123')

      // Check access was verified
      expect(pbGetFirstListItemSpy).toHaveBeenCalled()

      // Check word was deleted
      expect(pbDeleteSpy).toHaveBeenCalledWith('student-word-123')

      expect(result).toBe(true)
    })

    it('should throw error when user lacks access', async () => {
      // Mock access check failure
      pbGetFirstListItemSpy.mockRejectedValueOnce(new Error('No access'))

      await expect(
        studentService.removeWordFromStudent('student-123', 'student-word-123')
      ).rejects.toThrow('Unauthorized access to student dictionary')
    })
  })

  describe('updateStudentWord', () => {
    it('should update a student word', async () => {
      // Mock access check success
      pbGetFirstListItemSpy.mockResolvedValueOnce({ id: 'relation-123' })

      // Mock update success
      const updatedWord = {
        id: 'student-word-123',
        notes: 'Updated notes',
        mastery_level: 3
      }
      pbUpdateSpy.mockResolvedValueOnce(updatedWord)

      const result = await studentService.updateStudentWord('student-123', 'student-word-123', {
        notes: 'Updated notes',
        mastery_level: 3
      })

      // Check access was verified
      expect(pbGetFirstListItemSpy).toHaveBeenCalled()

      // Check word was updated
      expect(pbUpdateSpy).toHaveBeenCalledWith('student-word-123', {
        notes: 'Updated notes',
        mastery_level: 3
      })

      expect(result).toEqual(updatedWord)
    })

    it('should throw error when user lacks access', async () => {
      // Mock access check failure
      pbGetFirstListItemSpy.mockRejectedValueOnce(new Error('No access'))

      await expect(
        studentService.updateStudentWord('student-123', 'student-word-123', { notes: 'Test' })
      ).rejects.toThrow('Unauthorized access to student dictionary')
    })
  })
})
