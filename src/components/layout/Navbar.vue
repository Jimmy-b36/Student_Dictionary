<template>
  <div class="navbar-container">
    <Menubar class="mb-4">
      <template #start>
        <div class="flex items-center">
          <i class="pi pi-book text-primary text-xl mr-2"></i>
          <span class="font-bold text-xl mr-1">Student Dictionary</span>
          <span class="text-gray-500">v1.0.0</span>
        </div>
      </template>

      <template #end>
        <div class="flex gap-4">
          <Button
            label="Dictionary"
            icon="pi pi-book"
            class="p-button-text"
            @click="router.push('/home')"
          />
          <Button
            label="Students"
            icon="pi pi-users"
            class="p-button-text"
            @click="router.push('/home/teacher')"
          />
          <Button
            v-if="user"
            label="Logout"
            icon="pi pi-sign-out"
            class="p-button-text p-button-danger"
            @click="logout"
          />
        </div>
      </template>
    </Menubar>
  </div>
</template>

<script setup lang="ts">
import { useAuthService } from '@/composables/auth.service'
import { pb } from '@/utils/pocketbaseConnection'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { logout } = useAuthService()

const user = computed(() => pb.authStore.model)
</script>

<style scoped></style>
