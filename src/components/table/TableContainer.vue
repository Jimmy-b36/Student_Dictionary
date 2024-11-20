<template>
  <div class="flex items-center space-x-2 mb-4">
    <Input v-model="searchParam" class="mr-2" />
    <Button @click="searchDictionary(searchParam)">Search</Button>
  </div>
  <div class="border rounded-md">
    <Table />
    <div class="flex items-center justify-end py-4">
      <Button
        variant="outline"
        size="sm"
        :disabled="pagination.pageIndex === 0"
        @click="changePage('previous')"
      >
        Previous
      </Button>

      <Button variant="outline" size="sm" class="mx-2" @click="changePage('next')"> Next </Button>
    </div>
  </div>
</template>

<script setup lang="ts" generic="TData, TValue">
import Table from '@/components/table/Table.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDictionaryService } from '@/composables/dictionary'
import { useTableStore } from '@/stores/tableStore'
import { storeToRefs } from 'pinia'

import { computed, ref, watch } from 'vue'

const { searchDictionary, getDictionaryPage } = useDictionaryService()

const searchParam = ref('')
const { table } = useTableStore()
const { pagination } = storeToRefs(useTableStore())

const changePage = (direction: 'next' | 'previous') => {
  if (direction === 'next') {
    pagination.value.pageIndex++
  } else {
    pagination.value.pageIndex--
  }
}

watch(
  () => pagination.value.pageIndex,
  (newVal) => {
    getDictionaryPage(newVal + 1, 10)
  },
  { deep: true }
)

watch(searchParam, (newVal) => {
  searchDictionary(newVal)
})
</script>
