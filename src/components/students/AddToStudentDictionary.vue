<template>
  <Button
    icon="pi pi-plus"
    class="p-button-success p-button-rounded p-button-sm"
    @click="openDialog"
    v-tooltip.top="'Add to Student Dictionary'"
    :label="isAdmin ? '' : 'Add to Student Dictionary'"
  />

  <Dialog
    v-model:visible="showDialog"
    modal
    header="Add to Student Dictionary"
    :style="{ width: '500px' }"
  >
    <div class="flex flex-col gap-4">
      <div v-if="loading" class="flex justify-center my-4">
        <ProgressSpinner style="width: 50px; height: 50px" />
      </div>

      <div v-else-if="students.length === 0" class="p-4 text-center">
        <i class="pi pi-exclamation-triangle text-yellow-500 text-2xl mb-3"></i>
        <p>You don't have any students yet.</p>
        <Button
          label="Create a Student"
          icon="pi pi-user-plus"
          class="p-button-primary mt-3"
          @click="navigateToTeacherView"
        />
      </div>

      <div v-else>
        <div class="field mb-4">
          <label for="studentSelect" class="block font-medium mb-2">Select Student</label>
          <Dropdown
            id="studentSelect"
            v-model="selectedStudent"
            :options="students"
            optionLabel="display_name"
            placeholder="Choose a student"
            class="w-full"
          />
        </div>

        <div class="field mb-4">
          <label for="notes" class="block font-medium mb-2">Notes (optional)</label>
          <Textarea
            id="notes"
            v-model="notes"
            rows="3"
            class="w-full"
            placeholder="Add any notes about this word for the student..."
          />
        </div>

        <div class="field">
          <label class="block font-medium mb-2">Word Details</label>
          <div class="p-3 border-1 border-gray-200 rounded">
            <p class="font-bold text-lg">{{ word.word }}</p>

            <div class="mt-2">
              <span class="font-medium">Phonemes:</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <Tag v-for="phoneme in word.phonemes" :key="phoneme.id" severity="info" rounded>
                  {{ phoneme.phoneme }}
                </Tag>
                <span v-if="!word.phonemes?.length" class="text-gray-500 italic">None</span>
              </div>
            </div>

            <div class="mt-2">
              <span class="font-medium">Phonograms:</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <Tag
                  v-for="phonogram in word.phonograms"
                  :key="phonogram.id"
                  severity="success"
                  rounded
                >
                  {{ phonogram.phonogram }}
                </Tag>
                <span v-if="!word.phonograms?.length" class="text-gray-500 italic">None</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="showDialog = false" class="p-button-text" />
      <Button
        label="Add to Dictionary"
        icon="pi pi-check"
        @click="addWordToStudent"
        :disabled="!selectedStudent || loading || students.length === 0"
        class="p-button-success"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useStudentService, type IStudent } from '@/composables/student.service'
import { pb } from '@/utils/pocketbaseConnection'
import { useToast } from 'primevue/usetoast'
import { defineProps, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  word: {
    id: string
    word: string
    phonemes?: { id: string; phoneme: string }[]
    phonograms?: { id: string; phonogram: string }[]
  }
}>()

const router = useRouter()
const toast = useToast()
const studentService = useStudentService()
const showDialog = ref(false)
const selectedStudent = ref<IStudent | null>(null)
const notes = ref('')
const isAdmin = pb.authStore.isAdmin
const students = ref<IStudent[]>([])
const loading = ref(false)

const openDialog = async () => {
  showDialog.value = true

  try {
    const studentsData = await studentService.fetchStudents()
    students.value = studentsData
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Could not load your students',
      life: 3000
    })
  }
}

const addWordToStudent = async () => {
  if (!selectedStudent.value) return

  try {
    await studentService.addWordToStudent(selectedStudent.value.id, props.word.id, notes.value)

    // TODO: can I add a link in here directly to the student's dictionary?
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Added "${props.word.word}" to ${selectedStudent.value.display_name}'s dictionary`,
      link: `/home/student/${selectedStudent.value.id}`,
      life: 3000
    })

    selectedStudent.value = null
    notes.value = ''
    showDialog.value = false
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to add word to student',
      life: 3000
    })
  }
}

const navigateToTeacherView = () => {
  router.push('/home/teacher')
  showDialog.value = false
}
</script>

<style scoped></style>
