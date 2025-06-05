<template>
  <div class="flex flex-col p-5">
    <div v-if="loading" class="flex justify-center items-center h-60">
      <ProgressSpinner />
    </div>
    <div v-else>
      <StudentHeader :student="student" />

      <TabView>
        <TabPanel header="Words" value="0">
          <StudentWordTable
            :studentWords="studentWords"
            :studentId="studentId"
            @refresh-words="refreshStudentWords"
          />
        </TabPanel>

        <TabPanel header="Filtered Dictionary" value="1">
          <StudentFilteredDictionary
            :studentId="studentId"
            :studentPhonemes="studentPhonemes"
            :studentPhonograms="studentPhonograms"
            @word-added="refreshStudentWords"
          />
        </TabPanel>

        <TabPanel header="Phonemes & Phonograms" value="2">
          <div class="text-center py-8 text-gray-500">
            <p>Phoneme & Phonogram management will be available after resolving import issues</p>
          </div>
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
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const studentService = useStudentService();

const studentId = computed(() => route.params.id as string);
const loading = ref(true);
const student = ref<IStudent | null>(null);
const studentWords = ref<IStudentWord[]>([]);
const studentPhonemes = ref<IStudentPhoneme[]>([]);
const studentPhonograms = ref<IStudentPhonogram[]>([]);

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
      toast.add({
        severity: 'error',
        summary: 'Access Denied',
        detail: 'You do not have permission to view this student',
        life: 5000,
      });
      router.push('/home/teacher');
      return;
    }

    await initStudentData();
  } catch (error: any) {
    console.log('🥶 Error loading student:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load student data',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const initStudentData = async () => {
  studentPhonemes.value = await studentService.fetchStudentPhonemes(studentId.value);
  studentPhonograms.value = await studentService.fetchStudentPhonograms(studentId.value);
  studentWords.value = await studentService.fetchStudentWords(studentId.value);
};

const refreshStudentWords = async () => {
  try {
    const words = await studentService.fetchStudentWords(studentId.value);
    studentWords.value = words;
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load student words',
      life: 3000,
    });
  }
};

const refreshStudentPhonemes = async () => {
  try {
    const phonemes = await studentService.fetchStudentPhonemes(studentId.value);
    studentPhonemes.value = phonemes;
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load student phonemes',
      life: 3000,
    });
  }
};

const refreshStudentPhonograms = async () => {
  try {
    const phonograms = await studentService.fetchStudentPhonograms(studentId.value);
    studentPhonograms.value = phonograms;
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load student phonograms',
      life: 3000,
    });
  }
};

onMounted(loadStudentData);
</script>

<style scoped></style>
