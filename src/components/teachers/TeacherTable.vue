<template>
  <div class="flex w-full justify-center">
    <div class="w-full max-w-7xl p-5">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-primary">Your Students</h2>
        <AddStudentModal @create="refreshStudents" />
      </div>

      <div v-if="loading" class="flex justify-center my-8">
        <ProgressSpinner />
      </div>

      <div v-else-if="students.length === 0" class="text-center py-12">
        <div class="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
          <i class="pi pi-users text-6xl text-gray-400 mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No Students Yet</h3>
          <p class="text-gray-500 mb-6">
            Create your first student to get started with their dictionary.
          </p>
          <AddStudentModal @create="refreshStudents" />
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="student in students"
          :key="student.id"
          class="group relative rounded-xl border bg-slate-900 border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div
            class="bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 p-6 text-white relative overflow-hidden"
          >
            <div class="absolute inset-0 opacity-10">
              <div class="absolute top-2 right-2 w-16 h-16 rounded-full bg-white/20"></div>
              <div class="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-white/10"></div>
            </div>

            <div class="relative z-10 flex items-center space-x-4">
              <div class="flex-shrink-0">
                <div
                  class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30"
                >
                  <span class="text-xl font-bold text-white">
                    {{ student.display_name.charAt(0).toUpperCase() }}
                  </span>
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-lg font-semibold text-white truncate">
                  {{ student.display_name }}
                </h3>
                <p class="text-white/80 text-sm font-medium">ID: {{ student.unique_id }}</p>
              </div>
            </div>
          </div>

          <!-- Content Section -->
          <div class="p-6">
            <!-- Main Action Button -->
            <Button
              label="View Dictionary"
              icon="pi pi-book-open"
              class="w-full mb-4 p-button-primary group-hover:scale-105 transition-transform duration-200"
              @click="navigateToStudent(student.id, $event)"
            />

            <!-- Metadata -->
            <div class="flex items-center justify-center text-gray-500 mb-4">
              <i class="pi pi-calendar text-sm mr-2"></i>
              <span class="text-sm">
                Created
                {{
                  new Date(student.created).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                }}
              </span>
            </div>

            <div class="flex justify-center space-x-3">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-yellow-400 transition-colors duration-200"
              >
                <EditStudentModal :student="student" @updated="refreshStudents" @click.stop />
              </div>
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-400 transition-colors duration-200"
              >
                <DeleteStudentModal :student="student" @deleted="refreshStudents" @click.stop />
              </div>
            </div>
          </div>

          <!-- Hover Overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStudentService } from '@/composables/student.service';
import { useStudentStore } from '@/stores/student.store';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AddStudentModal from './AddStudentModal.vue';
import DeleteStudentModal from './DeleteStudentModal.vue';
import EditStudentModal from './EditStudentModal.vue';

const studentStore = useStudentStore();
const studentService = useStudentService();
const router = useRouter();
const { students, loading } = storeToRefs(studentStore);

const refreshStudents = async () => {
  await studentService.fetchStudents(true); // force refresh
};

const navigateToStudent = (studentId: string, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  router.push(`/home/student/${studentId}`);
};

onMounted(refreshStudents);
</script>

<style lang="scss" scoped>
.no-underline {
  text-decoration: none;
}
</style>
