<template>
  <DataTable
    :value="tableData"
    paginator
    :rows="10"
    tableStyle="min-width: 50rem"
    :rowsPerPageOptions="[5, 10, 20]"
    showGridlines
  >
    <Column field="word" header="Word" />
    <Column field="phonemes" header="Phonemes">
      <template #body="{ data }">
        <Tag
          v-for="phoneme in data.phonemes"
          :key="phoneme"
          :value="phoneme"
          severity="info"
          rounded
          class="mr-2"
        />
      </template>
    </Column>
    <Column field="phonograms" header="Phonograms">
      <template #body="{ data }">
        <Tag
          v-for="phonogram in data.phonograms"
          :key="phonogram"
          :value="phonogram"
          severity="success"
          rounded
          class="mr-2"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useTableStore } from '@/stores/tableStore'
import { storeToRefs } from 'pinia'

const { tableData } = storeToRefs(useTableStore())
</script>
