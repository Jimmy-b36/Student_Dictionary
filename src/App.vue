<template>
  <Button variant="secondary">Click me</Button>
  <div class="container py-10 mx-auto">
    <Table :columns="columns" :data="tableData" />
    <div class="flex items-center justify-end py-4 space-x-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="currentPage === 1"
        @click="changePage('previous')"
      >
        Previous
      </Button>
      <Button variant="outline" size="sm" @click="changePage('next')"> Next </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Table from '@/components/Table.vue'
import { columns } from '@/components/columns'

import { Button } from '@/components/ui/button'
import { computed, onBeforeMount, ref } from 'vue'

import { storeToRefs } from 'pinia'
import { useAuth } from './composables/auth'
import { useDictionary } from './composables/dictionary'
import { usePhonemes } from './composables/phonemes'
import { useDictionaryStore } from './stores/dictionary'
import { usePhonemesStore } from './stores/phonemes'

const { login } = useAuth()
const { fetchAllPhonemes } = usePhonemes()
const { fetchDictionary } = useDictionary()
const { phonemes } = storeToRefs(usePhonemesStore())
const { dictionary } = storeToRefs(useDictionaryStore())

const currentPage = ref(1)

const tableData = computed(() =>
  Array.from(dictionary.value, ([key, data]) => ({
    id: key,
    word: key,
    phonemes: Array.from(data.phonemes)
  }))
)

const changePage = (direction: 'previous' | 'next') => {
  if (direction === 'previous') {
    currentPage.value--
    fetchDictionary(currentPage.value, 30)
  } else {
    currentPage.value++
    fetchDictionary(currentPage.value, 30)
  }
}

onBeforeMount(async () => {
  await login()
  await fetchAllPhonemes()
  await fetchDictionary()
  console.log(phonemes.value)
  console.log(dictionary.value)
})
</script>

<style scoped lang="scss"></style>
