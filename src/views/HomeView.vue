<template>
  <div class="container py-10 mx-auto">
    <TableContainer v-if="!error" />

    <div v-else><Message severity="error">Error Loading Data. Please contact support</Message></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'

import { useDictionaryService } from '@/composables/dictionary.service'

const { initialPageLoad } = useDictionaryService()

const error = ref('')

onBeforeMount(async () => {
  try {
    await initialPageLoad()
  } catch (err) {
    error.value = 'Error loading data'
  }
})
</script>
<style lang="scss" scoped></style>
