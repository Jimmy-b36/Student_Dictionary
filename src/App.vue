<template>
  <div class="container py-10 mx-auto">
    <TableContainer />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'

import { useAuth } from './composables/auth'
import { useDictionaryService } from './composables/dictionary.service'
import { usePhonemes } from './composables/phonemes'

const { login } = useAuth()
const { fetchAllPhonemes } = usePhonemes()
const { getDictionaryPage } = useDictionaryService()

onBeforeMount(async () => {
  await login()
  await fetchAllPhonemes()
  await getDictionaryPage()
})
</script>

<style scoped lang="scss"></style>
