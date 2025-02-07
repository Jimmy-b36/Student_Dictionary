<template>
  <div class="flex items-center space-x-2 mb-4">
    <InputText v-model="wordSearch" class="mr-2" />
    <!-- TODO implement search -->
    <!-- <Button @click="searchDictionary(searchParam)">Search</Button>
    <MultiSelect
      v-model="searchParam"
      :options="phonemeOptions"
      placeholder="Phonemes"
      display="chip"
    /> -->
  </div>
  <Table />
</template>

<script setup lang="ts">
import { useDictionaryService } from '@/composables/dictionary.service'
import { useTableStore } from '@/stores/tableStore'
import { storeToRefs } from 'pinia'

import { ref, watch } from 'vue'

const { searchDictionary } = useDictionaryService()

const tableStore = useTableStore()

const wordSearch = ref('')

watch(wordSearch, (newVal) => {
  searchDictionary(newVal)
})
</script>
