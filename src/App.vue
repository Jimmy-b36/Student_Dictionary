<template>
  <Toast position="top-left">
    <template #message="slotProps">
      <div class="flex flex-col w-full">
        <div class="font-medium text-lg">{{ slotProps.message.summary }}</div>
        <p>{{ slotProps.message.detail }}</p>
        <Button
          v-if="slotProps.message.link"
          label="Go to Students Dictionary"
          icon="pi pi-book"
          class="p-button-sm mt-2 w-2/3"
          @click="() => router.push(slotProps.message.link)"
        ></Button>
      </div>
    </template>
  </Toast>
  <Navbar v-if="showNavbar" />
  <RouterView />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const showNavbar = computed(() => {
  return (
    !route.path.startsWith('/login') &&
    !route.path.startsWith('/register') &&
    !route.path.startsWith('/admin/login')
  )
})
</script>

<style></style>
