<template>
  <div class="navbar-container">
    <Menubar class="mb-4 flex justify-between" :model="menuItems">
      <template #start>
        <div class="flex items-center">
          <i class="pi pi-book text-primary text-xl mr-2"></i>
          <span class="font-bold text-xl mr-1">Student Dictionary</span>
          <span class="text-gray-500">v1.0.0</span>
        </div>
      </template>

      <template #item="{ item, props }">
        <a v-ripple :class="item.class" v-bind="props.action">
          <i :class="['pi', item.icon]"></i>
          <span>{{ item.label }}</span>
        </a>
      </template>
    </Menubar>
  </div>
</template>

<script setup lang="ts">
import { useAuthService } from '@/composables/auth.service'
import type { MenuItem } from 'primevue/menuitem'
import { useRouter } from 'vue-router'

const router = useRouter()
const { logout } = useAuthService()

const menuItems: MenuItem[] = [
  {
    label: 'Dictionary',
    icon: 'pi pi-book',
    class: 'p-button-text rounded',
    command: () => {
      router.push('/home')
    }
  },
  {
    label: 'Students',
    icon: 'pi pi-users',
    class: 'p-button-text rounded',
    command: () => {
      router.push('/home/teacher')
    }
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    class: 'p-button-text p-button-danger rounded',
    command: () => {
      logout()
    }
  }
]
</script>

<style scoped></style>
