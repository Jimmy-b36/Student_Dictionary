<template>
  <form
    class="w-full flex flex-col justify-center items-center gap-4 m-auto"
    @submit.prevent="onSubmit"
  >
    <Card class="w-full max-w-lg shadow-lg bg-white/90">
      <template #title> Add Word </template>
      <template #content>
        <div class="flex flex-col gap-4 p-2">
          <div>
            <label for="word" class="block mb-1 font-medium text-gray-700">Word</label>
            <InputText id="word" v-model="word" placeholder="Enter word..." class="w-full" />
          </div>
          <div>
            <label class="block mb-1 font-medium text-gray-700">Phonemes</label>
            <MultiSelect
              v-model="selectedPhonemes"
              :options="phonemes"
              option-label="phoneme"
              placeholder="Select phonemes"
              display="chip"
              filter
              class="w-full"
            />
          </div>
          <div>
            <label class="block mb-1 font-medium text-gray-700">Phonograms</label>
            <MultiSelect
              v-model="selectedPhonograms"
              :options="phonograms"
              option-label="phonogram"
              placeholder="Select phonograms"
              display="chip"
              filter
              class="w-full"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex flex-col gap-2 items-center">
          <Button
            type="submit"
            label="Add Word"
            icon="pi pi-plus"
            class="p-button-success w-full"
          />
          <transition name="fade">
            <div v-if="error" class="text-red-500 text-center animate-pulse">{{ error }}</div>
          </transition>
        </div>
      </template>
    </Card>
  </form>
</template>
<script setup lang="ts">
import { useDictionaryService } from '@/composables/dictionary.service';
import { useDictionaryStore } from '@/stores/dictionary';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const word = ref('');
const selectedPhonemes = ref([]);
const selectedPhonograms = ref([]);
const error = ref('');

const dictionaryStore = storeToRefs(useDictionaryStore());
const { phonemes, phonograms } = dictionaryStore;
const { addWordToDictionary } = useDictionaryService();

const toast = useToast();

const validateWord = (word: string): string | null => {
  if (!word.trim()) {
    return 'Word is required';
  }

  if (word.trim().length > 50) {
    return 'Word must be at most 50 characters long';
  }

  if (!/^[a-zA-Z]+$/.test(word.trim())) {
    return 'Word must contain only letters (no spaces, numbers, or special characters)';
  }

  return null;
};

const onSubmit = async () => {
  error.value = '';

  // Validate word
  const validationError = validateWord(word.value);
  if (validationError) {
    error.value = validationError;
    return;
  }

  try {
    await addWordToDictionary(
      word.value.trim(),
      selectedPhonemes.value.map((p: any) => p.id),
      selectedPhonograms.value.map((p: any) => p.id)
    );
    word.value = '';
    selectedPhonemes.value = [];
    selectedPhonograms.value = [];
    toast.add({
      severity: 'success',
      summary: 'Word Added',
      detail: 'Successfully added word to dictionary!',
      life: 2000,
    });
  } catch (e: any) {
    error.value = e.message;
    console.log('🔥', e);
  }
};
</script>
<style lang="css">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
