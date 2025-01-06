<template>
  <div class="flex items-center space-x-2 mb-4">
    <InputText v-model="searchParam" class="mr-2" />
    <Button @click="searchDictionary(searchParam)">Search</Button>
  </div>
  <Table />
</template>

<script setup lang="ts">
import { useDictionaryService } from '@/composables/dictionary.service'
import { useTableStore } from '@/stores/tableStore'
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'

import { computed, ref, watch } from 'vue'

const { searchDictionary, getDictionaryPage } = useDictionaryService()

const searchParam = ref('')

const changePage = (direction: 'next' | 'previous') => {
  // implement pagination
}

watch(searchParam, (newVal) => {
  searchDictionary(newVal)
})
</script>
