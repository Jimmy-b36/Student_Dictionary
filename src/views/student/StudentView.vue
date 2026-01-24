<template>
  <div class="flex flex-col p-5">
    <div v-if="loading" class="flex justify-center items-center h-60">
      <ProgressSpinner />
    </div>
    <div v-else>
      <StudentHeader :student="student" />

      <TabView>
        <TabPanel header="Filtered Dictionary" value="0">
          <StudentFilteredDictionary
            :studentPhonemes="studentPhonemes"
            :studentPhonograms="studentPhonograms"
            :loading="dictionaryLoading"
            :addingWords="addingWords"
            @refresh="loadFilteredDictionary"
            @add-word="addWordToStudent"
          />
        </TabPanel>
        <TabPanel header="Words" value="1">
          <StudentWordTable
            :studentWords="studentWords"
            :studentId="studentId"
            @refresh-words="refreshStudentWords"
          />
        </TabPanel>

        <TabPanel header="Phonemes & Phonograms" value="2">
          <StudentPhonemePhonogramManager
            :studentId="studentId"
            :studentPhonemes="studentPhonemes"
            :studentPhonograms="studentPhonograms"
            @refresh-phonemes="refreshStudentPhonemes"
            @refresh-phonograms="refreshStudentPhonograms"
          />
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useStudentService,
  type IStudent,
  type IStudentPhoneme,
  type IStudentPhonogram,
  type IStudentWord
} from '@/composables/student.service'
import { useDictionaryService } from '@/composables/dictionary.service'
import { useToastHelper } from '@/composables/toast.helper'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type StudentState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'loaded'
      student: IStudent
      studentWords: IStudentWord[]
      studentPhonemes: IStudentPhoneme[]
      studentPhonograms: IStudentPhonogram[]
      dictionaryLoading: boolean
    }

const route = useRoute()
const router = useRouter()
const toast = useToastHelper()
const studentService = useStudentService()
const dictionaryService = useDictionaryService()

const studentId = computed(() => route.params.id as string)
const state = ref<StudentState>({ status: 'loading' })
const addingWords = ref(new Set<string>())

const loading = computed(() => state.value.status === 'loading')
const student = computed(() => (state.value.status === 'loaded' ? state.value.student : null))
const studentWords = computed(() =>
  state.value.status === 'loaded' ? state.value.studentWords : []
)
const studentPhonemes = computed(() =>
  state.value.status === 'loaded' ? state.value.studentPhonemes : []
)
const studentPhonograms = computed(() =>
  state.value.status === 'loaded' ? state.value.studentPhonograms : []
)
const dictionaryLoading = computed(() =>
  state.value.status === 'loaded' ? state.value.dictionaryLoading : false
)

const loadStudentData = async () => {
  state.value = { status: 'loading' }

  try {
    const [studentData, hasAccess] = await Promise.all([
      studentService.fetchStudent(studentId.value),
      studentService.checkTeacherAccess(studentId.value)
    ])

    if (!hasAccess) {
      toast.error('You do not have permission to view this student', 'Access Denied')
      router.push('/home/teacher')
      state.value = { status: 'error', message: 'Unauthorized access' }
      return
    }

    const student: IStudent = {
      id: studentData.id,
      display_name: studentData.display_name,
      unique_id: studentData.unique_id,
      created: new Date(studentData.created).toLocaleString()
    }

    await initStudentData(student)
  } catch (error: any) {
    const message = error.message || 'Failed to load student data'
    state.value = { status: 'error', message }
    toast.error(message)
  }
}

const initStudentData = async (student: IStudent) => {
  const [phonemes, phonograms, words] = await Promise.all([
    studentService.fetchStudentPhonemes(studentId.value),
    studentService.fetchStudentPhonograms(studentId.value),
    studentService.fetchStudentWords(studentId.value)
  ])

  if (phonemes.length > 0 || phonograms.length > 0) {
    const phonemeSearchArr = phonemes.map((p) => ({
      id: p.phoneme_id,
      phoneme: p.phoneme
    }))

    const phonogramSearchArr = phonograms.map((p) => ({
      id: p.phonogram_id,
      phonogram: p.phonogram
    }))

    try {
      await dictionaryService.combinedSearchParallel(phonemeSearchArr, phonogramSearchArr)
    } catch (error) {
      console.error('Error loading filtered dictionary:', error)
      await dictionaryService.getDictionaryPage(1, 50)
    }
  }

  state.value = {
    status: 'loaded',
    student,
    studentPhonemes: phonemes,
    studentPhonograms: phonograms,
    studentWords: words,
    dictionaryLoading: false
  }
}

const loadFilteredDictionary = async () => {
  if (state.value.status !== 'loaded') return

  const { studentPhonemes, studentPhonograms } = state.value

  if (studentPhonemes.length === 0 && studentPhonograms.length === 0) {
    return
  }

  state.value = { ...state.value, dictionaryLoading: true }

  try {
    const phonemeSearchArr = studentPhonemes.map((p) => ({
      id: p.phoneme_id,
      phoneme: p.phoneme
    }))

    const phonogramSearchArr = studentPhonograms.map((p) => ({
      id: p.phonogram_id,
      phonogram: p.phonogram
    }))

    await dictionaryService.combinedSearchParallel(phonemeSearchArr, phonogramSearchArr)
  } catch (error) {
    console.error('Error loading filtered dictionary:', error)
    await dictionaryService.getDictionaryPage(1, 50)
  } finally {
    if (state.value.status === 'loaded') {
      state.value = { ...state.value, dictionaryLoading: false }
    }
  }
}

const addWordToStudent = async (wordData: { word: string; wordId: string }) => {
  if (!wordData.wordId) {
    console.error('❌ wordId is missing from wordData:', wordData)
    toast.error('Word ID is missing - cannot add to student dictionary')
    return
  }

  addingWords.value.add(wordData.word)

  try {
    await studentService.addWordToStudent(studentId.value, wordData.wordId)
    toast.success(`Added "${wordData.word}" to student's dictionary`)
    await refreshStudentWords()
  } catch (error: any) {
    toast.error(error.message || 'Failed to add word to student')
  } finally {
    addingWords.value.delete(wordData.word)
  }
}

const refreshStudentWords = async () => {
  if (state.value.status !== 'loaded') return

  try {
    const words = await studentService.fetchStudentWords(studentId.value)
    state.value = { ...state.value, studentWords: words }
  } catch (error: any) {
    toast.error('Failed to load student words')
  }
}

const refreshStudentPhonemes = async () => {
  if (state.value.status !== 'loaded') return

  try {
    const phonemes = await studentService.fetchStudentPhonemes(studentId.value)
    state.value = { ...state.value, studentPhonemes: phonemes }
    await loadFilteredDictionary()
  } catch (error: any) {
    toast.error('Failed to load student phonemes')
  }
}

const refreshStudentPhonograms = async () => {
  if (state.value.status !== 'loaded') return

  try {
    const phonograms = await studentService.fetchStudentPhonograms(studentId.value)
    state.value = { ...state.value, studentPhonograms: phonograms }
    await loadFilteredDictionary()
  } catch (error: any) {
    toast.error('Failed to load student phonograms')
  }
}

onMounted(loadStudentData)
</script>

<style scoped></style>
