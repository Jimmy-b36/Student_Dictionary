<template>
  <DataTable
    :value="tableData"
    paginator
    :rows="10"
    tableStyle="min-width: 50rem"
    :rowsPerPageOptions="[5, 10, 20]"
    showGridlines
    @page="onPageChange"
  >
    <Column field="word" header="Word" />
    <Column field="phonemes" header="Phonemes">
      <template #body="{ data }">
        <Tag
          v-for="phoneme in data.phonemes"
          :key="phoneme"
          severity="info"
          rounded
          class="mr-2 !items-center"
        >
          <template #icon>
            <span class="mx-1 text-lg">{{ phoneme.phoneme }}</span>
            <RemoveTagModal
              :word="data.word"
              :word-id="data.id"
              :tag="phoneme.phoneme"
              :tag-id="phoneme.id"
              :is-phoneme="true"
            />
          </template>
        </Tag>
        <AddTagModal :word="data.word" :word-id="data.id" :is-phoneme="true" />
      </template>
    </Column>
    <Column field="phonograms" header="Phonograms">
      <template #body="{ data }">
        <Tag
          v-for="phonogram in data.phonograms"
          :key="phonogram"
          severity="success"
          rounded
          class="mr-2 !items-end"
        >
          <template #icon>
            <span class="mx-1 text-lg">{{ phonogram.phonogram }}</span>
            <RemoveTagModal
              :word="data.word"
              :word-id="data.id"
              :tag="phonogram.phonogram"
              :tag-id="phonogram.id"
              :is-phoneme="false"
            />
          </template>
        </Tag>
        <AddTagModal :word="data.word" :word-id="data.id" :is-phoneme="false" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useTableStore } from '@/stores/tableStore'
import { storeToRefs } from 'pinia'
import { type DataTablePageEvent } from 'primevue/datatable'
const { tableData } = storeToRefs(useTableStore())

const onPageChange = (page: DataTablePageEvent) => {
  const totalFetchItems = 100
  // adjusted page number for pre fetching
  const adjustedPage = Math.floor((page.first + page.rows) / totalFetchItems)
  if (page.page >= page.pageCount - 3) {
    useTableStore().fetchNextPages(adjustedPage + 1, totalFetchItems)
  }
}
</script>
