<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-700 mb-6">Login</h1>
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              required
              class="mt-1 block w-full"
              :inputClass="'w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'"
            />
          </div>
          <Button
            type="submit"
            label="Login"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/auth.service'
import { ref } from 'vue'
const { login } = useAuth()

import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')

const handleSubmit = async () => {
  await login(email.value, password.value)
  router.push('/home')
}
</script>
