<template>
  <div class="max-w-[200px] truncate cursor-pointer hover:text-primary" @click="showModal">
    {{ word.notes || 'Add notes...' }}
  </div>

  <Dialog v-model:visible="visible" modal header="Edit Notes" :style="{ width: '450px' }">
    <div class="flex flex-col gap-4">
      <div>
        <label for="editNotes" class="block mb-2 font-medium">Notes for "{{ word?.word }}"</label>
        <Textarea
          id="editNotes"
          v-model="notes"
          rows="5"
          class="w-full"
          placeholder="Enter any notes about this word..."
        />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="visible = false" class="p-button-text" />
      <Button
        label="Save Notes"
        icon="pi pi-check"
        @click="handleSaveNotes"
        class="p-button-primary"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useStudentService, type IStudentWord } from '@/composables/student.service'
import { useToastHelper } from '@/composables/toast.helper'
import { ref, watch } from 'vue'

const props = defineProps<{
  word: IStudentWord
  studentId: string
}>()

const emit = defineEmits<{
  'notes-saved': []
}>()

const notes = ref('')
const loading = ref(false)
const visible = ref(false)
const toast = useToastHelper()
const studentService = useStudentService()

watch(
  () => props.word,
  (newWord) => {
    if (newWord) {
      notes.value = newWord.notes || ''
    }
  },
  { immediate: true }
)

const showModal = () => {
  notes.value = props.word.notes || ''
  visible.value = true
}

const handleSaveNotes = async () => {
  loading.value = true
  try {
    await studentService.updateStudentWord(props.studentId, props.word.id, {
      notes: notes.value
    })
    toast.success('Notes updated successfully')
    visible.value = false
    emit('notes-saved')
  } catch (error: any) {
    toast.error('Failed to update notes')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
