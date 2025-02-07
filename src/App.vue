<template>
  <div class="container py-10 mx-auto">
    <TableContainer />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'

import { useAuth } from './composables/auth'
import { useDictionaryService } from './composables/dictionary.service'

const { login } = useAuth()
const { getDictionaryPage, fetchAllPhonemes, fetchAllPhonograms } = useDictionaryService()

onBeforeMount(async () => {
  await login()
  await fetchAllPhonograms()
  await fetchAllPhonemes()
  await getDictionaryPage()
})
</script>

<style scoped lang="scss"></style>
