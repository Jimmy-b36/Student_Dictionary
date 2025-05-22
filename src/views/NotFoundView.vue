<template>
  <div class="flex w-full justify-center flex-col items-center animate-fadeIn">
    <Card class="!shadow-none !bg-transparent">
      <template #header>
        <div class="flex justify-center w-full p-3">
          <span class="text-8xl font-bold text-primary">404</span>
        </div>
      </template>
      <template #content>
        <div class="flex flex-col items-center gap-4 py-5">
          <h1 class="text-4xl font-medium text-900 m-0">Page Not Found</h1>
          <p class="text-xl text-600 text-center">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div class="flex gap-3 mt-5">
            <Button label="Go Back" icon="pi pi-arrow-left" outlined @click="router.go(-1)" />
            <Button label="Go Home" icon="pi pi-home" @click="router.push({ name: 'Home' })" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
