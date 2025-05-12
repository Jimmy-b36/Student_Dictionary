<template>
  <DataTable
    :value="tableData"
    paginator
    :rows="10"
    tableStyle="min-width: 50rem"
    :rowsPerPageOptions="[5, 10, 20]"
    showGridlines
    @page="onPageChange"
    :loading="props.loading"
  >
    <template #empty data-test-id="empty-table"> No results found. </template>
    <Column field="word" header="Word" />
    <Column field="phonemes" header="Phonemes">
      <template #body="{ data }">
        <div class="flex flex-wrap gap-2">
          <draggable
            v-model="data.phonemes"
            v-bind="dragOptions"
            item-key="id"
            @change="() => handleReorder(data.phonemes, data.word, data.id, true)"
            class="flex flex-wrap gap-2"
            @start="drag = true"
            @end="drag = false"
            :group="`${data.word} phonemes`"
            :disabled="!isAdmin"
          >
            <template #item="{ element }">
              <transition-group
                type="transition"
                name="flip-list"
                tag="div"
                class="flex flex-wrap gap-2"
              >
                <Tag :key="element.id" severity="info" rounded class="!items-center">
                  <template #icon>
                    <img
                      :src="dragHandle"
                      alt="drag handle"
                      class="h-5 w-5"
                      :class="!isAdmin && '!hidden'"
                    />
                    <span class="mr-1 text-lg">{{ element.phoneme }}</span>
                    <RemoveTagModal
                      :word="data.word"
                      :word-id="data.id"
                      :tag="element.phoneme"
                      :tag-id="element.id"
                      :is-phoneme="true"
                      :is-admin="isAdmin"
                    />
                  </template>
                </Tag>
              </transition-group>
            </template>
          </draggable>
          <AddTagModal
            :word="data.word"
            :word-id="data.id"
            :is-phoneme="true"
            :is-admin="isAdmin"
          />
        </div>
      </template>
    </Column>
    <Column field="phonograms" header="Phonograms">
      <template #body="{ data }">
        <div class="flex flex-wrap gap-2">
          <draggable
            v-model="data.phonograms"
            v-bind="dragOptions"
            item-key="id"
            @change="() => handleReorder(data.phonograms, data.word, data.id, false)"
            class="flex flex-wrap gap-2"
            @start="drag = true"
            @end="drag = false"
            :group="`${data.word} phonograms`"
            :disabled="!isAdmin"
          >
            <template #item="{ element }">
              <transition-group
                type="transition"
                name="flip-list"
                tag="div"
                class="flex flex-wrap gap-2"
              >
                <Tag
                  :key="element.id"
                  severity="success"
                  rounded
                  class="!items-center !justify-center"
                >
                  <template #icon>
                    <img
                      :src="dragHandle"
                      alt="drag handle"
                      class="h-5 w-5"
                      :class="!isAdmin && '!hidden'"
                    />
                    <span class="mx-1 text-lg">{{ element.phonogram }}</span>
                    <RemoveTagModal
                      :word="data.word"
                      :word-id="data.id"
                      :tag="element.phonogram"
                      :tag-id="element.id"
                      :is-phoneme="false"
                      :is-admin="isAdmin"
                    />
                  </template>
                </Tag>
              </transition-group>
            </template>
          </draggable>
          <AddTagModal
            :word="data.word"
            :word-id="data.id"
            :is-phoneme="false"
            :is-admin="isAdmin"
          />
        </div>
      </template>
    </Column>
    <Column
      field="actions"
      header="Actions"
      center
      style="max-width: 11rem"
      :header-style="{ textAlign: 'center' }"
    >
      <template #body="{ data }">
        <div class="flex gap-2 justify-center">
          <AddToStudentDictionary :word="data" />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import dragHandle from '@/assets/drag-handle-svgrepo-com.svg?url'
import { useDictionaryService } from '@/composables/dictionary.service'
import { useSearchStore } from '@/stores/searchStore'
import { useTableStore } from '@/stores/tableStore'
import { pb } from '@/utils/pocketbaseConnection'
import { storeToRefs } from 'pinia'
import { type DataTablePageEvent } from 'primevue/datatable'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'
import draggable from 'vuedraggable'

const tableStore = useTableStore()
const { tableData } = storeToRefs(tableStore)
const { reorderTags } = useDictionaryService()
const { hasActiveFilters } = storeToRefs(useSearchStore())

const props = defineProps(['loading'])

const drag = ref(false)
const toast = useToast()
const isAdmin = computed(() => pb.authStore.model?.isSuper)

const dragOptions = computed(() => {
  return {
    animation: 200,
    group: 'description',
    disabled: false,
    ghostClass: 'ghost'
  }
})

const handleReorder = async (tags: any[], word: string, wordId: number, isPhoneme: boolean) => {
  try {
    await reorderTags(word, String(wordId), tags, isPhoneme)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to reorder ${isPhoneme ? 'phonemes' : 'phonograms'} for "${word}"`,
      life: 3000
    })
  }
}

const onPageChange = (page: DataTablePageEvent) => {
  if (hasActiveFilters.value) {
    return
  }
  const totalFetchItems = 100
  // adjusted page number for pre fetching
  const adjustedPage = Math.floor((page.first + page.rows) / totalFetchItems)
  if (page.page >= page.pageCount - 3) {
    tableStore.fetchNextPages(adjustedPage + 1, totalFetchItems)
  }
}
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  border-radius: 0.5rem;
}
</style>
