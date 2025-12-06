<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <template #title>Add Phonemes</template>
        <template #content>
          <div class="space-y-4">
            <MultiSelect
              v-model="selectedPhonemes"
              :options="availablePhonemes"
              optionLabel="phoneme"
              optionValue="id"
              placeholder="Select phonemes to add"
              :filter="true"
              class="w-full"
            />
            <Button
              label="Add Selected Phonemes"
              icon="pi pi-plus"
              @click="addPhonemes"
              :disabled="selectedPhonemes.length === 0"
              :loading="addingPhonemes"
              class="w-full"
            />
          </div>
        </template>
      </Card>

      <!-- Add Phonograms -->
      <Card>
        <template #title>Add Phonograms</template>
        <template #content>
          <div class="space-y-4">
            <MultiSelect
              v-model="selectedPhonograms"
              :options="availablePhonograms"
              optionLabel="phonogram"
              optionValue="id"
              placeholder="Select phonograms to add"
              :filter="true"
              class="w-full"
            />
            <Button
              label="Add Selected Phonograms"
              icon="pi pi-plus"
              @click="addPhonograms"
              :disabled="selectedPhonograms.length === 0"
              :loading="addingPhonograms"
              class="w-full"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Tables Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Student Phonemes Table -->
      <Card>
        <template #title>
          <div class="flex justify-between items-center">
            <span>Student Phonemes ({{ studentPhonemes.length }})</span>
            <Button
              icon="pi pi-refresh"
              size="small"
              text
              @click="$emit('refresh-phonemes')"
              :loading="loading"
            />
          </div>
        </template>
        <template #content>
          <DataTable
            :value="studentPhonemes"
            dataKey="id"
            :loading="loading"
            class="p-datatable-sm"
            size="small"
          >
            <template #empty>
              <div class="text-center py-4">
                <p class="text-gray-500">No phonemes assigned to this student</p>
              </div>
            </template>

            <Column field="phoneme" header="Phoneme" sortable>
              <template #body="{ data }">
                <Tag severity="info" rounded>{{ data.phoneme }}</Tag>
              </template>
            </Column>

            <Column field="date_added" header="Date Added" sortable style="min-width: 120px">
              <template #body="{ data }">
                <span class="text-sm text-gray-600">{{ data.date_added }}</span>
              </template>
            </Column>

            <Column header="Actions" style="width: 80px">
              <template #body="{ data }">
                <Button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  text
                  @click="removePhoneme(data)"
                  :loading="removingItems.has(data.id)"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Student Phonograms Table -->
      <Card>
        <template #title>
          <div class="flex justify-between items-center">
            <span>Student Phonograms ({{ studentPhonograms.length }})</span>
            <Button
              icon="pi pi-refresh"
              size="small"
              text
              @click="$emit('refresh-phonograms')"
              :loading="loading"
            />
          </div>
        </template>
        <template #content>
          <DataTable
            :value="studentPhonograms"
            dataKey="id"
            :loading="loading"
            class="p-datatable-sm"
            size="small"
          >
            <template #empty>
              <div class="text-center py-4">
                <p class="text-gray-500">No phonograms assigned to this student</p>
              </div>
            </template>

            <Column field="phonogram" header="Phonogram" sortable>
              <template #body="{ data }">
                <Tag severity="success" rounded>{{ data.phonogram }}</Tag>
              </template>
            </Column>

            <Column field="date_added" header="Date Added" sortable style="min-width: 120px">
              <template #body="{ data }">
                <span class="text-sm text-gray-600">{{ data.date_added }}</span>
              </template>
            </Column>

            <Column header="Actions" style="width: 80px">
              <template #body="{ data }">
                <Button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  text
                  @click="removePhonogram(data)"
                  :loading="removingItems.has(data.id)"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
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
import { useToastHelper } from '@/composables/toast.helper';
import { useDictionaryStore } from '@/stores/dictionary';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

interface Props {
  studentId: string;
  studentPhonemes: IStudentPhoneme[];
  studentPhonograms: IStudentPhonogram[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'refresh-phonemes': [];
  'refresh-phonograms': [];
}>();

const studentService = useStudentService();
const dictionaryStore = useDictionaryStore();
const { phonemes, phonograms } = storeToRefs(dictionaryStore);
const toast = useToastHelper();

const loading = ref(false);
const addingPhonemes = ref(false);
const addingPhonograms = ref(false);
const removingItems = ref(new Set<string>());
const selectedPhonemes = ref<string[]>([]);
const selectedPhonograms = ref<string[]>([]);

const availablePhonemes = computed(() => {
  const assignedPhonemeIds = new Set(props.studentPhonemes.map((p) => p.phoneme_id));
  return phonemes.value.filter((p) => !assignedPhonemeIds.has(p.id));
});

const availablePhonograms = computed(() => {
  const assignedPhonogramIds = new Set(props.studentPhonograms.map((p) => p.phonogram_id));
  return phonograms.value.filter((p) => !assignedPhonogramIds.has(p.id));
});

const addPhonemes = async () => {
  if (selectedPhonemes.value.length === 0) return;

  addingPhonemes.value = true;
  try {
    await studentService.addPhonemesToStudent(props.studentId, selectedPhonemes.value);
    toast.success(`Added ${selectedPhonemes.value.length} phoneme(s) to student`);
    selectedPhonemes.value = [];
    emit('refresh-phonemes');
  } catch (error: any) {
    toast.error(error.message || 'Failed to add phonemes');
  } finally {
    addingPhonemes.value = false;
  }
};

const addPhonograms = async () => {
  if (selectedPhonograms.value.length === 0) return;

  addingPhonograms.value = true;
  try {
    await studentService.addPhonogramsToStudent(props.studentId, selectedPhonograms.value);
    toast.success(`Added ${selectedPhonograms.value.length} phonogram(s) to student`);
    selectedPhonograms.value = [];
    emit('refresh-phonograms');
  } catch (error: any) {
    toast.error(error.message || 'Failed to add phonograms');
  } finally {
    addingPhonograms.value = false;
  }
};

const removePhoneme = async (phoneme: IStudentPhoneme) => {
  removingItems.value.add(phoneme.id);

  try {
    await studentService.removePhonemeFromStudent(props.studentId, phoneme.id);
    toast.success(`Removed phoneme "${phoneme.phoneme}" from student`);
    emit('refresh-phonemes');
  } catch (error: any) {
    toast.error(error.message || 'Failed to remove phoneme');
  } finally {
    removingItems.value.delete(phoneme.id);
  }
};

const removePhonogram = async (phonogram: IStudentPhonogram) => {
  removingItems.value.add(phonogram.id);

  try {
    await studentService.removePhonogramFromStudent(props.studentId, phonogram.id);
    toast.success(`Removed phonogram "${phonogram.phonogram}" from student`);
    emit('refresh-phonograms');
  } catch (error: any) {
    toast.error(error.message || 'Failed to remove phonogram');
  } finally {
    removingItems.value.delete(phonogram.id);
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
