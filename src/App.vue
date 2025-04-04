<template>
  <Navbar v-if="showNavbar" />
  <RouterView />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const showNavbar = computed(() => {
  return (
    !route.path.startsWith('/login') &&
    !route.path.startsWith('/register') &&
    !route.path.startsWith('/admin/login')
  )
})
</script>

<style></style>
