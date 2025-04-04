<template>
  <Button
    icon="pi pi-trash"
    class="p-button-danger p-button-rounded p-button-sm"
    @click="confirmDelete"
    v-tooltip.top="'Delete'"
  />
  <Dialog
    :visible="isVisible"
    @update:visible="isVisible = $event"
    :modal="true"
    :style="{ width: '450px' }"
    header="Confirm Deletion"
    :closable="false"
  >
    <div class="p-fluid">
      <div class="mb-4">
        <p>Are you sure you want to delete student <strong>{{ student?.display_name }}</strong>?</p>
        <p class="text-red-500 mt-2">This action cannot be undone.</p>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="isVisible = false"
          class="p-button-outlined"
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          @click="handleDelete"
          class="p-button-danger"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { type IStudent } from '@/composables/student.service'
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useStudentStore } from '@/stores/student.store'
import { storeToRefs } from 'pinia'
import { useStudentService } from '@/composables/student.service'

const props = defineProps<{
  student: IStudent
}>()

const emit = defineEmits(['deleted'])
const studentStore = useStudentStore()
const studentService = useStudentService()
const { loading } = storeToRefs(studentStore)
const toast = useToast()
const isVisible = ref(false)

const confirmDelete = () => {
  isVisible.value = true
}

const handleDelete = async () => {
  console.log('🥶', 'Deleting student', props.student)
  
  try {
    await studentService.deleteStudent(props.student.id)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Student ${props.student.display_name} deleted successfully`,
      life: 3000
    })
    isVisible.value = false
    emit('deleted')
  } catch (error: any) {
    console.log('🥶', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to delete student',
      life: 3000
    })
  }
}
</script>

<style scoped></style>