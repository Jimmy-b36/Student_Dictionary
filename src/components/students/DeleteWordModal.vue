<template>
  <Button
    icon="pi pi-trash"
    class="p-button-danger p-button-rounded p-button-sm"
    @click="showModal"
    v-tooltip.top="'Remove Word'"
  />
  <Dialog v-model:visible="visible" modal header="Remove Word" :style="{ width: '450px' }">
    <div class="p-4">
      <p>
        Are you sure you want to remove <strong>{{ word?.word }}</strong> from this student's
        dictionary?
      </p>
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="visible = false" class="p-button-text" />
      <Button label="Remove" icon="pi pi-trash" @click="handleRemoveWord" class="p-button-danger" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useStudentService, type IStudentWord } from '@/composables/student.service'
import { useToastHelper } from '@/composables/toast.helper'
import { ref } from 'vue'

const props = defineProps<{
  word: IStudentWord
  studentId: string
}>()

const emit = defineEmits<{
  'word-removed': []
}>()

const toast = useToastHelper()
const studentService = useStudentService()
const loading = ref(false)
const visible = ref(false)

const showModal = () => {
  visible.value = true
}

const handleRemoveWord = async () => {
  loading.value = true
  try {
    await studentService.removeWordFromStudent(props.studentId, props.word.id)
    toast.success('Word removed from student dictionary')
    visible.value = false
    emit('word-removed')
  } catch (error: any) {
    toast.error('Failed to remove word')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
