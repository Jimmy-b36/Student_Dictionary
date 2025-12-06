<template>
  <Button
    icon="pi pi-pencil"
    class="p-button-text text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 !p-2 !w-8 !h-8"
    @click="openModal"
    v-tooltip.top="'Edit'"
  />
  <Dialog
    :visible="isVisible"
    @update:visible="isVisible = $event"
    :modal="true"
    :style="{ width: '450px' }"
    header="Edit Student"
    :closable="false"
  >
    <div class="p-fluid">
      <div class="field mb-4">
        <label for="identifier" class="block mb-2 font-medium">Display Name</label>
        <InputText id="identifier" v-model="name" required autofocus class="w-full" />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="isVisible = false"
          class="p-button-outlined"
        />
        <Button label="Save" icon="pi pi-check" @click="handleUpdate" class="p-button-warning" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useStudentService, type IStudent } from '@/composables/student.service';
import { useToastHelper } from '@/composables/toast.helper';
import { useStudentStore } from '@/stores/student.store';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

const props = defineProps<{
  student: IStudent;
}>();

const emit = defineEmits(['updated']);
const studentStore = useStudentStore();
const studentService = useStudentService();
const { loading } = storeToRefs(studentStore);
const toast = useToastHelper();
const isVisible = ref(false);
const name = ref('');

// Update the form when student prop changes
watch(
  () => props.student,
  (newStudent) => {
    if (newStudent) {
      name.value = newStudent.display_name;
    }
  },
  { immediate: true }
);

const openModal = () => {
  name.value = props.student.display_name;
  isVisible.value = true;
};

const handleUpdate = async () => {
  if (!name.value.trim()) {
    toast.error('Student name is required');
    return;
  }

  try {
    await studentService.updateStudent(props.student.id, name.value);
    toast.success('Student updated successfully');
    isVisible.value = false;
    emit('updated');
  } catch (error: any) {
    console.log('🥶', error);
    toast.error(error.message || 'Failed to update student');
  }
};
</script>

<style scoped></style>
