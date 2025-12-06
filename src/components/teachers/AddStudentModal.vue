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
    :modal="true"
    :style="{ width: '450px' }"
    header="Create Student"
    :closable="false"
  >
    <div class="p-fluid">
      <div class="field mb-4">
        <label for="identifier" class="block mb-2 font-medium">Nickname</label>
        <InputText id="identifier" v-model="name" required autofocus class="w-full" />
        <small class="text-gray-500"
          >Under <span class="font-bold text-red-500">NO</span> circumstances should you use a
          student's real name</small
        >
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
import { useStudentService } from '@/composables/student.service'
import { useToastHelper } from '@/composables/toast.helper'
import { ref } from 'vue'

const studentService = useStudentService()
const toast = useToastHelper()
const isVisible = ref(false)
const name = ref('')

const handleCreateStudent = async () => {
  if (!name.value.trim()) {
    toast.error('Student name is required')
    return
  }

  try {
    await studentService.createStudent(name.value)
    toast.success('Student created successfully')
    isVisible.value = false
    name.value = ''
    emit('create')
  } catch (err: any) {
    toast.error(err.message || 'Failed to create student')
  }
}

const emit = defineEmits(['create'])
</script>

<style scoped></style>
