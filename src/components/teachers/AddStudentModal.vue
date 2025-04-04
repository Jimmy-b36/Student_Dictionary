<template>
  <Button
    label="Create Student"
    icon="pi pi-plus"
    severity="success"
    @click="isVisible = true"
    class="px-4 py-2"
  />
  <Dialog
    :visible="isVisible"
    @click="isVisible = true"
    :modal="true"
    :style="{ width: '450px' }"
    header="Create Student"
    :closable="false"
  >
    <div class="p-fluid">
      <div class="field mb-4">
        <label for="identifier" class="block mb-2 font-medium">Nickname</label>
        <InputText id="identifier" v-model="name" required autofocus class="w-full" />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="isVisible = false"
          class="p-button-outlined !bg-red-400 !text-white !border-none"
        />
        <Button
          label="Create"
          icon="pi pi-check"
          @click="handleCreateStudent"
          class="p-button-primary"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useStudentStore } from '@/stores/student.store'
import { storeToRefs } from 'pinia'
import { useStudentService } from '@/composables/student.service'

const studentStore = useStudentStore()
const studentService = useStudentService()
const { loading } = storeToRefs(studentStore)
const toast = useToast()
const isVisible = ref(false)
const name = ref('')

const handleCreateStudent = async () => {
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
    await studentService.createStudent(name.value)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Student created successfully',
      life: 3000
    })
    isVisible.value = false
    name.value = ''
    emit('create')
  } catch (error: any) {
    console.log('🥶', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to create student',
      life: 3000
    })
  }
}

const emit = defineEmits(['create'])
</script>

<style scoped></style>
