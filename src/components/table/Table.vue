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
        <div class="flex flex-wrap gap-2">
          <draggable
            v-model="data.phonemes"
            item-key="id"
            @change="() => handleReorder(data.phonemes, data.word, data.id, true)"
            class="flex flex-wrap gap-2"
          >
            <template #header></template>
            <template #item="{ element }">
              <Tag severity="info" rounded class="mr-2 !items-center cursor-move">
                <template #icon>
                  <span class="mx-1 text-lg">{{ element.phoneme }}</span>
                  <RemoveTagModal
                    :word="data.word"
                    :word-id="data.id"
                    :tag="element.phoneme"
                    :tag-id="element.id"
                    :is-phoneme="true"
                  />
                </template>
              </Tag>
            </template>
          </draggable>
          <AddTagModal :word="data.word" :word-id="data.id" :is-phoneme="true" />
        </div>
      </template>
    </Column>
    <Column field="phonograms" header="Phonograms">
      <template #body="{ data }">
        <div class="flex flex-wrap gap-2">
          <draggable
            v-model="data.phonograms"
            item-key="id"
            @change="() => handleReorder(data.phonograms, data.word, data.id, false)"
            class="flex flex-wrap gap-2"
          >
            <template #header></template>
            <template #item="{ element }">
              <Tag severity="success" rounded class="mr-2 !items-end cursor-move">
                <template #icon>
                  <span class="mx-1 text-lg">{{ element.phonogram }}</span>
                  <RemoveTagModal
                    :word="data.word"
                    :word-id="data.id"
                    :tag="element.phonogram"
                    :tag-id="element.id"
                    :is-phoneme="false"
                  />
                </template>
              </Tag>
            </template>
          </draggable>
          <AddTagModal :word="data.word" :word-id="data.id" :is-phoneme="false" />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useDictionaryService } from '@/composables/dictionary.service'
import { useTableStore } from '@/stores/tableStore'
import { storeToRefs } from 'pinia'
import { type DataTablePageEvent } from 'primevue/datatable'
import draggable from 'vuedraggable'

const tableStore = useTableStore()
const { tableData } = storeToRefs(tableStore)
const { reorderTags } = useDictionaryService()

const handleReorder = async (tags: any[], word: string, wordId: number, isPhoneme: boolean) => {
  console.log('🥶 Reorder event:', { word, wordId, isPhoneme })
  // I need to make the re-order faster, it re-orders then sends the request, can I update the UI then send the request?
  try {
    await reorderTags(word, String(wordId), tags, isPhoneme)
  } catch (error) {
    console.log('🥶 Error handling reorder:', error)
  }
}

const onPageChange = (page: DataTablePageEvent) => {
  const totalFetchItems = 100
  // adjusted page number for pre fetching
  const adjustedPage = Math.floor((page.first + page.rows) / totalFetchItems)
  if (page.page >= page.pageCount - 3) {
    tableStore.fetchNextPages(adjustedPage + 1, totalFetchItems)
  }
}
</script>
