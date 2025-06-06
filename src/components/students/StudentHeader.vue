<template>
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-3xl font-bold text-primary mb-2">{{ student?.display_name }}'s Dictionary</h2>
      <p class="text-sm text-gray-500">ID: {{ student?.unique_id }}</p>
    </div>
    <div class="flex gap-3">
      <Button
        label="Back to Students"
        icon="pi pi-arrow-left"
        class="p-button-secondary"
        @click="router.push({ name: 'Home' })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type IStudent } from '@/composables/student.service';
import { useRouter } from 'vue-router';

defineProps<{
  student: IStudent | null;
}>();

const router = useRouter();
</script>

<style scoped></style>
