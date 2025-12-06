<template>
  <div class="flex flex-col p-5">
    <div v-if="loading" class="flex justify-center items-center h-60">
      <ProgressSpinner />
    </div>
    <div v-else>
      <StudentHeader :student="student" />

      <TabView>
        <TabPanel header="Filtered Dictionary" value="0">
          <StudentFilteredDictionary
            :studentPhonemes="studentPhonemes"
            :studentPhonograms="studentPhonograms"
            :loading="dictionaryLoading"
            :addingWords="addingWords"
            @refresh="loadFilteredDictionary"
            @add-word="addWordToStudent"
          />
        </TabPanel>
        <TabPanel header="Words" value="1">
          <StudentWordTable
            :studentWords="studentWords"
            :studentId="studentId"
            @refresh-words="refreshStudentWords"
          />
        </TabPanel>

        <TabPanel header="Phonemes & Phonograms" value="2">
          <StudentPhonemePhonogramManager
            :studentId="studentId"
            :studentPhonemes="studentPhonemes"
            :studentPhonograms="studentPhonograms"
            @refresh-phonemes="refreshStudentPhonemes"
            @refresh-phonograms="refreshStudentPhonograms"
          />
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useStudentService,
  type IStudent,
  type IStudentPhoneme,
  type IStudentPhonogram,
  type IStudentWord,
} from '@/composables/student.service';
import { useDictionaryService } from '@/composables/dictionary.service';
import { useToastHelper } from '@/composables/toast.helper';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToastHelper();
const studentService = useStudentService();
const dictionaryService = useDictionaryService();

const studentId = computed(() => route.params.id as string);
const loading = ref(true);
const dictionaryLoading = ref(false);
const student = ref<IStudent | null>(null);
const studentWords = ref<IStudentWord[]>([]);
const studentPhonemes = ref<IStudentPhoneme[]>([]);
const studentPhonograms = ref<IStudentPhonogram[]>([]);
const addingWords = ref(new Set<string>());

const loadStudentData = async () => {
  loading.value = true;
  try {
    const studentData = await studentService.fetchStudent(studentId.value);
    student.value = {
      id: studentData.id,
      display_name: studentData.display_name,
      unique_id: studentData.unique_id,
      created: new Date(studentData.created).toLocaleString(),
    };
    const hasAccess = await studentService.checkTeacherAccess(studentId.value);
    if (!hasAccess) {
      toast.error('You do not have permission to view this student', 'Access Denied');
      router.push('/home/teacher');
      return;
    }

    await initStudentData();
  } catch (error: any) {
    toast.error('Failed to load student data');
  } finally {
    loading.value = false;
  }
};

const initStudentData = async () => {
  studentPhonemes.value = await studentService.fetchStudentPhonemes(studentId.value);
  studentPhonograms.value = await studentService.fetchStudentPhonograms(studentId.value);
  studentWords.value = await studentService.fetchStudentWords(studentId.value);
  await loadFilteredDictionary();
};

const loadFilteredDictionary = async () => {
  if (studentPhonemes.value.length === 0 && studentPhonograms.value.length === 0) {
    return;
  }

  dictionaryLoading.value = true;
  try {
    const phonemeSearchArr = studentPhonemes.value.map((p) => ({
      id: p.phoneme_id,
      phoneme: p.phoneme,
    }));

    const phonogramSearchArr = studentPhonograms.value.map((p) => ({
      id: p.phonogram_id,
      phonogram: p.phonogram,
    }));

    await dictionaryService.combinedSearchParallel(phonemeSearchArr, phonogramSearchArr);
  } catch (error) {
    console.error('Error loading filtered dictionary:', error);
    await dictionaryService.getDictionaryPage(1, 50);
  } finally {
    dictionaryLoading.value = false;
  }
};

const addWordToStudent = async (wordData: { word: string; wordId: string }) => {
  if (!wordData.wordId) {
    console.error('❌ wordId is missing from wordData:', wordData);
    toast.error('Word ID is missing - cannot add to student dictionary');
    return;
  }

  addingWords.value.add(wordData.word);

  try {
    await studentService.addWordToStudent(studentId.value, wordData.wordId);
    toast.success(`Added "${wordData.word}" to student's dictionary`);
    await refreshStudentWords();
  } catch (error: any) {
    toast.error(error.message || 'Failed to add word to student');
  } finally {
    addingWords.value.delete(wordData.word);
  }
};

const refreshStudentWords = async () => {
  try {
    const words = await studentService.fetchStudentWords(studentId.value);
    studentWords.value = words;
  } catch (error: any) {
    toast.error('Failed to load student words');
  }
};

const refreshStudentPhonemes = async () => {
  try {
    const phonemes = await studentService.fetchStudentPhonemes(studentId.value);
    studentPhonemes.value = phonemes;
    await loadFilteredDictionary();
  } catch (error: any) {
    toast.error('Failed to load student phonemes');
  }
};

const refreshStudentPhonograms = async () => {
  try {
    const phonograms = await studentService.fetchStudentPhonograms(studentId.value);
    studentPhonograms.value = phonograms;
    await loadFilteredDictionary();
  } catch (error: any) {
    toast.error('Failed to load student phonograms');
  }
};

onMounted(loadStudentData);
</script>

<style scoped></style>
