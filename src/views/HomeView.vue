<template>
  <div class="container py-10 mx-auto">
    <TableContainer />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'

import { useDictionaryService } from '@/composables/dictionary.service'

const { getDictionaryPage, fetchAllPhonemes, fetchAllPhonograms } = useDictionaryService()

onBeforeMount(async () => {
  await fetchAllPhonograms()
  await fetchAllPhonemes()
  await getDictionaryPage()
})
</script>
<style lang="scss" scoped></style>
