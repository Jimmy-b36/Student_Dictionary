<template>
  <Button
    icon="pi pi-trash"
    class="p-button-text text-red-600 hover:text-red-700 hover:bg-red-50 !p-2 !w-8 !h-8"
    @click="confirmDelete"
    v-tooltip.top="'Delete'"
  />
  <Dialog
    :visible="isVisible"
    @update:visible="isVisible = $event"
    :modal="true"
    :style="{ width: '450px' }"
    header="Confirm Deletion"
    :closable="false"
  >
    <div class="p-fluid">
      <div class="mb-4">
        <p>
          Are you sure you want to delete student <strong>{{ student?.display_name }}</strong
          >?
        </p>
        <p class="text-red-500 mt-2">This action cannot be undone.</p>
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
        <Button label="Delete" icon="pi pi-trash" @click="handleDelete" class="p-button-danger" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useStudentService, type IStudent } from '@/composables/student.service';
import { useToastHelper } from '@/composables/toast.helper';
import { ref } from 'vue';

const props = defineProps<{
  student: IStudent;
}>();

const emit = defineEmits(['deleted']);
const studentService = useStudentService();
const toast = useToastHelper();
const isVisible = ref(false);

const confirmDelete = () => {
  isVisible.value = true;
};

const handleDelete = async () => {
  console.log('🥶', 'Deleting student', props.student);

  try {
    await studentService.deleteStudent(props.student.id);
    toast.success(`Student ${props.student.display_name} deleted successfully`);
    isVisible.value = false;
    emit('deleted');
  } catch (error: any) {
    console.log('🥶', error);
    toast.error(error.message || 'Failed to delete student');
  }
};
</script>

<style scoped></style>
