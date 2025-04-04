<template>
  <Button
    icon="pi pi-pencil"
    class="p-button-warning p-button-rounded p-button-sm"
    @click="openModal"
    v-tooltip.top="'Edit'"
  />
  <Dialog
    :visible="isVisible"
    @update:visible="isVisible = $event"
    :modal="true"
    :style="{ width: '450px' }"
    header="Edit Student"
    :closable="false"
  >
    <div class="p-fluid">
      <div class="field mb-4">
        <label for="identifier" class="block mb-2 font-medium">Display Name</label>
        <InputText id="identifier" v-model="name" required autofocus class="w-full" />
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
          label="Save"
          icon="pi pi-check"
          @click="handleUpdate"
          class="p-button-warning"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { type IStudent } from '@/composables/student.service'
import { ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useStudentStore } from '@/stores/student.store'
import { storeToRefs } from 'pinia'
import { useStudentService } from '@/composables/student.service'

const props = defineProps<{
  student: IStudent
}>()

const emit = defineEmits(['updated'])
const studentStore = useStudentStore()
const studentService = useStudentService()
const { loading } = storeToRefs(studentStore)
const toast = useToast()
const isVisible = ref(false)
const name = ref('')

// Update the form when student prop changes
watch(() => props.student, (newStudent) => {
  if (newStudent) {
    name.value = newStudent.display_name
  }
}, { immediate: true })

const openModal = () => {
  name.value = props.student.display_name
  isVisible.value = true
}

const handleUpdate = async () => {
  if (!name.value.trim()) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Student name is required',
      life: 3000
    })
    return
  }
  
  try {
    await studentService.updateStudent(props.student.id, name.value)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Student updated successfully',
      life: 3000
    })
    isVisible.value = false
    emit('updated')
  } catch (error: any) {
    console.log('🥶', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to update student',
      life: 3000
    })
  }
}
</script>

<style scoped></style>
