<template>
  <Button
    icon="pi pi-trash"
    class="p-button-danger p-button-rounded p-button-sm"
    @click="showModal"
    v-tooltip.top="'Delete Word'"
  />
  <Dialog v-model:visible="visible" modal header="Delete Word" :style="{ width: '450px' }">
    <div class="p-4">
      <p>
        Are you sure you want to delete <strong>{{ word }}</strong> from the global dictionary?
      </p>
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="visible = false" class="p-button-text" />
      <Button
        label="Delete"
        icon="pi pi-trash"
        @click="handleDelete"
        class="p-button-danger"
        :loading="loading"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useDictionaryService } from '@/composables/dictionary.service';
import { useToastHelper } from '@/composables/toast.helper';
import { ref } from 'vue';

const props = defineProps<{
  word: string;
  wordId: string;
}>();

const emit = defineEmits<{
  'word-deleted': [];
}>();

const { deleteWordFromDictionary } = useDictionaryService();
const toast = useToastHelper();
const visible = ref(false);
const loading = ref(false);

const showModal = () => {
  visible.value = true;
};

const handleDelete = async () => {
  loading.value = true;
  try {
    await deleteWordFromDictionary(props.wordId);
    toast.success(`Deleted "${props.word}" from dictionary`, 'Deleted');
    visible.value = false;
    emit('word-deleted');
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete word');
  } finally {
    loading.value = false;
  }
};
</script>
