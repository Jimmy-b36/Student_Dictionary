<template>
  <AddWordForm />
</template>
<script setup lang="ts">
import { useDictionaryService } from '@/composables/dictionary.service';
import { onBeforeMount, ref } from 'vue';
const { initialPageLoad } = useDictionaryService();

const error = ref('');

onBeforeMount(async () => {
  try {
    await initialPageLoad();
  } catch (err) {
    error.value = 'Error loading data';
  }
});
</script>
<style lang="css"></style>
