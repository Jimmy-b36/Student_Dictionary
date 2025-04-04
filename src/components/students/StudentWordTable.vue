<template>
  <div>
    <div v-if="studentWords.length === 0" class="p-6 bg-gray-100 rounded-lg text-center">
      <i class="pi pi-book text-4xl text-gray-400 mb-3"></i>
      <h3 class="text-xl font-semibold mb-2">No Words Yet</h3>
      <p class="text-gray-500 mb-4">This student hasn't learned any words yet.</p>
    </div>

    <DataTable
      v-else
      :value="studentWords"
      tableStyle="min-width: 50rem"
      class="mb-4"
      stripedRows
      showGridlines
      paginator
      :rows="10"
      responsiveLayout="scroll"
      :rowHover="true"
    >
      <Column field="word" header="Word" sortable style="min-width: 12rem">
        <template #body="{ data }">
          <div class="font-bold">{{ data.word }}</div>
        </template>
      </Column>
      <Column field="phonemes" header="Phonemes" style="min-width: 14rem">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <Tag v-for="phoneme in data.phonemes" :key="phoneme.id" severity="info" rounded>
              {{ phoneme.phoneme }}
            </Tag>
            <span v-if="data.phonemes.length === 0" class="text-gray-400 italic">None</span>
          </div>
        </template>
      </Column>
      <Column field="phonograms" header="Phonograms" style="min-width: 14rem">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <Tag
              v-for="phonogram in data.phonograms"
              :key="phonogram.id"
              severity="success"
              rounded
            >
              {{ phonogram.phonogram }}
            </Tag>
            <span v-if="data.phonograms.length === 0" class="text-gray-400 italic">None</span>
          </div>
        </template>
      </Column>
      <Column field="notes" header="Notes" style="min-width: 12rem">
        <template #body="{ data }">
          <div class="group relative">
            <EditNotesModal :word="data" :studentId="studentId" @notes-saved="refreshWords" />
          </div>
        </template>
      </Column>
      <Column field="mastery_level" header="Mastery" style="min-width: 8rem">
        <template #body="{ data }">
          <div class="flex items-center">
            <Rating
              v-model="data.mastery_level"
              :stars="5"
              :readonly="false"
              :cancel="false"
              @change="updateMastery(data)"
            />
          </div>
        </template>
      </Column>
      <Column field="date_added" header="Added" sortable style="min-width: 8rem" />
      <Column header="Actions" style="min-width: 6rem">
        <template #body="{ data }">
          <div class="flex gap-2 justify-center">
            <DeleteWordModal :word="data" :studentId="studentId" @word-removed="refreshWords" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { useStudentService, type IStudentWord } from '@/composables/student.service'
import { useToast } from 'primevue/usetoast'
import { ref } from 'vue'
import DeleteWordModal from './DeleteWordModal.vue'
import EditNotesModal from './EditNotesModal.vue'

const props = defineProps<{
  studentWords: IStudentWord[]
  studentId: string
}>()

const emit = defineEmits<{
  'refresh-words': []
}>()

const toast = useToast()
const studentService = useStudentService()
const loading = ref(false)

const updateMastery = async (word: IStudentWord) => {
  loading.value = true
  try {
    await studentService.updateStudentWord(props.studentId, word.id, {
      mastery_level: word.mastery_level
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Mastery level updated',
      life: 2000
    })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update mastery level',
      life: 3000
    })
    // Reset UI to match server state
    refreshWords()
  } finally {
    loading.value = false
  }
}

const refreshWords = () => {
  emit('refresh-words')
}
</script>

<style scoped></style>
