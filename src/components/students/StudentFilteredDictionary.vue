<template>
  <div class="flex flex-col gap-4">
    <div v-if="loading" class="flex flex-col justify-center items-center h-40 gap-3">
      <ProgressSpinner />
    </div>

    <div v-else>
      <div class="mb-4 p-4 rounded-lg">
        <h3 class="text-lg font-semibold mb-2">Student's Learning Profile</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 class="font-medium text-gray-700 mb-1">Phonemes ({{ studentPhonemes.length }})</h4>
            <div class="flex flex-wrap gap-1">
              <Tag v-for="phoneme in studentPhonemes" :key="phoneme.id" severity="info" rounded>
                {{ phoneme.phoneme }}
              </Tag>
              <span v-if="studentPhonemes.length === 0" class="text-gray-500 text-sm"
                >No phonemes assigned</span
              >
            </div>
          </div>
          <div>
            <h4 class="font-medium text-gray-700 mb-1">
              Phonograms ({{ studentPhonograms.length }})
            </h4>
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="phonogram in studentPhonograms"
                :key="phonogram.id"
                severity="success"
                rounded
              >
                {{ phonogram.phonogram }}
              </Tag>
              <span v-if="studentPhonograms.length === 0" class="text-gray-500 text-sm"
                >No phonograms assigned</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="mb-4 flex gap-2">
        <Button
          label="Refresh Dictionary"
          icon="pi pi-refresh"
          @click="handleRefresh"
          :loading="loading"
        />
      </div>

      <DataTable
        :value="filteredWords"
        paginator
        :rows="20"
        dataKey="word"
        :loading="loading"
        class="p-datatable-sm"
      >
        <template #empty>
          <div class="text-center py-4">
            <p v-if="studentPhonemes.length === 0 && studentPhonograms.length === 0">
              No phonemes or phonograms assigned to this student. Please add some in the "Phonemes &
              Phonograms" tab.
            </p>
            <p v-else>No words found matching the student's phonemes and phonograms.</p>
          </div>
        </template>

        <Column field="word" header="Word" sortable style="min-width: 200px">
          <template #body="{ data }">
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ data.word }}</span>
              <Button
                icon="pi pi-plus"
                size="small"
                severity="success"
                text
                @click="handleAddWord(data)"
                :loading="addingWords.has(data.word)"
                v-tooltip.top="'Add to student dictionary'"
              />
            </div>
          </template>
        </Column>

        <Column header="Phonemes" style="min-width: 200px">
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="phoneme in Array.from(data.phonemes as Set<{ id: string; phoneme: string }>)"
                :key="phoneme.id"
                severity="info"
                rounded
              >
                {{ phoneme.phoneme }}
              </Tag>
            </div>
          </template>
        </Column>

        <Column header="Phonograms" style="min-width: 200px">
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="phonogram in Array.from(
                  data.phonograms as Set<{ id: string; phonogram: string }>
                )"
                :key="phonogram.id"
                severity="success"
                rounded
              >
                {{ phonogram.phonogram }}
              </Tag>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IStudentPhoneme, IStudentPhonogram } from '@/composables/student.service'
import { useDictionaryStore } from '@/stores/dictionary'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

interface Props {
  studentPhonemes: IStudentPhoneme[]
  studentPhonograms: IStudentPhonogram[]
  loading: boolean
  addingWords: Set<string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
  'add-word': [wordData: { word: string; wordId: string }]
}>()

const dictionaryStore = useDictionaryStore()
const { dictionary } = storeToRefs(dictionaryStore)

const filteredWords = computed(() => {
  return Array.from(dictionary.value.entries()).map(([word, entry]) => ({
    word,
    wordId: entry.wordId,
    phonemes: entry.phonemes,
    phonograms: entry.phonograms
  }))
})
console.log('filtered', filteredWords.value)
console.log('dictionary', dictionary.value)
const handleAddWord = (wordData: { word: string; wordId: string }) => {
  emit('add-word', wordData)
}

const handleRefresh = () => {
  emit('refresh')
}
</script>
