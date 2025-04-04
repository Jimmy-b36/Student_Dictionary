<template>
  <div class="flex flex-col p-5">
    <div v-if="loading" class="flex justify-center items-center h-60">
      <ProgressSpinner />
    </div>
    <div v-else>
      <StudentHeader :student="student" />

      <StudentWordTable
        :studentWords="studentWords"
        :studentId="studentId"
        @refresh-words="refreshStudentWords"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import StudentHeader from '@/components/students/StudentHeader.vue'
import StudentWordTable from '@/components/students/StudentWordTable.vue'
import { useStudentService, type IStudent, type IStudentWord } from '@/composables/student.service'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const studentService = useStudentService()

const studentId = computed(() => route.params.id as string)
const loading = ref(true)
const student = ref<IStudent | null>(null)
const studentWords = ref<IStudentWord[]>([])

const loadStudentData = async () => {
  loading.value = true
  try {
    const studentData = await studentService.fetchStudent(studentId.value)
    student.value = {
      id: studentData.id,
      display_name: studentData.display_name,
      unique_id: studentData.unique_id,
      created: new Date(studentData.created).toLocaleString()
    }

    const hasAccess = await studentService.checkTeacherAccess(studentId.value)
    if (!hasAccess) {
      toast.add({
        severity: 'error',
        summary: 'Access Denied',
        detail: 'You do not have permission to view this student',
        life: 5000
      })
      router.push('/home/teacher')
      return
    }

    await refreshStudentWords()
  } catch (error: any) {
    console.log('🥶 Error loading student:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load student data',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const refreshStudentWords = async () => {
  try {
    const words = await studentService.fetchStudentWords(studentId.value)
    studentWords.value = words
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load student words',
      life: 3000
    })
  }
}

onMounted(loadStudentData)
</script>

<style scoped></style>
