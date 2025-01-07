<template>
  <div class="flex items-center space-x-2 mb-4">
    <InputText v-model="searchParam" class="mr-2" />
    <Button @click="searchDictionary(searchParam)">Search</Button>
    <MultiSelect
      v-model="searchParam"
      :options="phonemeOptions"
      placeholder="Phonemes"
      display="chip"
    />
  </div>
  <Table />
</template>

<script setup lang="ts">
import { useDictionaryService } from '@/composables/dictionary.service'
import { useTableStore } from '@/stores/tableStore'
import { storeToRefs } from 'pinia'

import { computed, ref, watch } from 'vue'

const { searchDictionary, getDictionaryPage, phonemeSearch } = useDictionaryService()

const tableStore = useTableStore()
const { searchParam } = storeToRefs(tableStore)

const selectedPhonemes = ref()
const selectedPhonograms = ref()
const phonemeOptions = ref([
  '/o͝o/',
  '/oi/',
  '/ow/',
  '/o͞o/',
  '/or/',
  '/ar/',
  '/ər/',
  '/ē/',
  '/ōō/',
  '/ū/',
  '/ō/',
  '/ī/',
  '/ā/',
  '/hw/',
  '/kw/',
  '/ks/',
  '/ch/',
  '/th/',
  '/sh/',
  '/z/',
  '/v/',
  '/w/',
  '/y/',
  '/ŭ/',
  '/d/',
  '/ĕ/',
  '/ŏ/',
  '/l/',
  '/r/',
  '/t/',
  '/n/',
  '/g/',
  '/p/',
  '/j/',
  '/k/',
  '/f/',
  '/h/',
  '/ĭ/',
  '/s/',
  '/b/',
  '/m/',
  '/ă/'
])

// watch(searchParam, (newVal) => {
//   searchDictionary(newVal)
// })

watch(searchParam, (newVal) => {
  console.log('🔥', newVal)
  phonemeSearch(newVal)
})
</script>
