<template>
  <Button severity="secondary" @click="handleLogout">Logout <i class="pi pi-sign-out"></i></Button>
</template>
<script setup lang="ts">
import { useAuthService } from '@/composables/auth.service'
import { useRouter } from 'vue-router'
const { logout } = useAuthService()

const router = useRouter()

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>
<style lang="scss" scoped></style>
