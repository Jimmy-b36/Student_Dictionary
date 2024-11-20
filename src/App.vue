<template>
  <div class="container py-10 mx-auto">
    <TableContainer />
  </div>
</template>

<script setup lang="ts">
import TableContainer from '@/components/table/TableContainer.vue'

import { Button } from '@/components/ui/button'
import { onBeforeMount } from 'vue'

import { useAuth } from './composables/auth'
import { useDictionaryService } from './composables/dictionary'
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
