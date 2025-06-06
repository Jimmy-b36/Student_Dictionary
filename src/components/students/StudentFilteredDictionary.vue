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
          @click="loadFilteredDictionary"
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
                @click="addWordToStudent(data)"
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
import { useDictionaryService } from '@/composables/dictionary.service';
import {
  useStudentService,
  type IStudentPhoneme,
  type IStudentPhonogram,
} from '@/composables/student.service';
import { useDictionaryStore } from '@/stores/dictionary';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

interface Props {
  studentId: string;
  studentPhonemes: IStudentPhoneme[];
  studentPhonograms: IStudentPhonogram[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'word-added': [];
}>();

const dictionaryService = useDictionaryService();
const studentService = useStudentService();
const dictionaryStore = useDictionaryStore();
const toast = useToast();
const { dictionary, phonemes, phonograms, loading: dictLoading } = storeToRefs(dictionaryStore);

const loading = ref(false);
const isInitialized = ref(false);
const addingWords = ref(new Set<string>());

const filteredWords = computed(() => {
  return Array.from(dictionary.value.entries()).map(([word, entry]) => ({
    word,
    wordId: entry.wordId,
    phonemes: entry.phonemes,
    phonograms: entry.phonograms,
  }));
});

const loadFilteredDictionary = async () => {
  if (!isInitialized.value) {
    console.log('Dictionary not yet initialized, waiting...');
    return;
  }

  if (dictLoading.value) {
    console.log('Dictionary still loading, waiting...');
    return;
  }

  if (props.studentPhonemes.length === 0 && props.studentPhonograms.length === 0) {
    dictionary.value.clear();
    return;
  }

  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const phonemeSearchArr = props.studentPhonemes.map((p) => ({
      id: p.phoneme_id,
      phoneme: p.phoneme,
    }));

    const phonogramSearchArr = props.studentPhonograms.map((p) => ({
      id: p.phonogram_id,
      phonogram: p.phonogram,
    }));

    // Use the new combined parallel search function for improved performance
    // This fetches data in chunks of 50 records in parallel, significantly reducing load time
    await dictionaryService.combinedSearchParallel(phonemeSearchArr, phonogramSearchArr, 50);
  } catch (error) {
    console.error('Error loading filtered dictionary:', error);
    await dictionaryService.getDictionaryPage(1, 50);
  } finally {
    loading.value = false;
  }
};

const loadFilteredDictionaryLegacy = async () => {
  if (!isInitialized.value) {
    console.log('Dictionary not yet initialized, waiting...');
    return;
  }

  if (dictLoading.value) {
    console.log('Dictionary still loading, waiting...');
    return;
  }

  if (props.studentPhonemes.length === 0 && props.studentPhonograms.length === 0) {
    dictionary.value.clear();
    return;
  }

  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const phonemeSearchArr = props.studentPhonemes.map((p) => ({
      id: p.phoneme_id,
      phoneme: p.phoneme,
    }));

    const phonogramSearchArr = props.studentPhonograms.map((p) => ({
      id: p.phonogram_id,
      phonogram: p.phonogram,
    }));

    dictionary.value.clear();

    // Original sequential search method
    if (phonemeSearchArr.length > 0) {
      await dictionaryService.phonemeSearch(phonemeSearchArr);
    }

    if (phonogramSearchArr.length > 0) {
      if (phonemeSearchArr.length === 0) {
        await dictionaryService.phonogramSearch(phonogramSearchArr);
      } else {
        const phonemeResults = new Map(dictionary.value);

        await dictionaryService.phonogramSearch(phonogramSearchArr);
        const phonogramResults = new Map(dictionary.value);

        dictionary.value.clear();
        for (const [word, entry] of phonemeResults) {
          if (phonogramResults.has(word)) {
            dictionary.value.set(word, entry);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading filtered dictionary:', error);
    await dictionaryService.getDictionaryPage(1, 50);
  } finally {
    loading.value = false;
  }
};

const addWordToStudent = async (wordData: { word: string; wordId: string }) => {
  console.log('🔥 addWordToStudent - wordData:', wordData);

  if (!wordData.wordId) {
    console.error('❌ wordId is missing from wordData:', wordData);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Word ID is missing - cannot add to student dictionary',
      life: 5000,
    });
    return;
  }

  addingWords.value.add(wordData.word);

  try {
    await studentService.addWordToStudent(props.studentId, wordData.wordId);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Added "${wordData.word}" to student's dictionary`,
      life: 3000,
    });

    emit('word-added');
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to add word to student',
      life: 5000,
    });
  } finally {
    addingWords.value.delete(wordData.word);
  }
};

watch(() => [props.studentPhonemes, props.studentPhonograms], loadFilteredDictionary, {
  deep: true,
  immediate: true,
});

onMounted(async () => {
  const checkInitialization = () => {
    if (phonemes.value.length > 0 && phonograms.value.length > 0 && !dictLoading.value) {
      isInitialized.value = true;
      loadFilteredDictionary();
    } else {
      setTimeout(checkInitialization, 200);
    }
  };

  checkInitialization();
});
</script>
