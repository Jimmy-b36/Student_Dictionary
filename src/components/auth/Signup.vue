<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-700 mb-6">Create Account</h1>
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <InputText
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <Password
              id="password"
              v-model="form.password"
              :feedback="false"
              required
              toggleMask
              class="mt-1 block w-full"
              :inputClass="'w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700"
              >Confirm Password</label
            >
            <Password
              id="confirmPassword"
              v-model="form.confirmPassword"
              :feedback="false"
              required
              toggleMask
              class="mt-1 block w-full"
              :inputClass="'w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'"
            />
          </div>

          <div>
            <label class="inline-flex items-center mt-4">
              <input
                type="checkbox"
                v-model="form.tosAccepted"
                :disabled="!checkTosAccepted()"
                class="form-checkbox h-5 w-5 text-indigo-600 mr-2"
              />

              <TOSDialog ref="tosDialogRef" />
            </label>
          </div>

          <Button
            type="submit"
            :label="isSubmitting ? 'Creating Account...' : 'Sign Up'"
            :disabled="isSubmitting"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          />
        </div>
      </form>
      <slot name="toggleLogin"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthService } from '@/composables/auth.service'
import { useToast } from 'primevue/usetoast'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import TOSDialog from './TOSDialog.vue'

const router = useRouter()
const { signup } = useAuthService()
const toast = useToast()
const isSubmitting = ref(false)
const tosDialogRef = ref()

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  tosAccepted: false
})

const checkTosAccepted = () => {
  if (tosDialogRef.value) {
    form.tosAccepted = tosDialogRef.value.tosAccepted
  }
  return form.tosAccepted
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): boolean => {
  return password.length >= 8
}

const validateForm = (): boolean => {
  const errors: string[] = []

  if (!form.email) {
    errors.push('Email is required')
  } else if (!validateEmail(form.email)) {
    errors.push('Please enter a valid email address')
  }

  if (!form.password) {
    errors.push('Password is required')
  } else if (!validatePassword(form.password)) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!form.confirmPassword) {
    errors.push('Please confirm your password')
  } else if (form.password !== form.confirmPassword) {
    errors.push('Passwords do not match')
  }

  if (!form.tosAccepted) {
    errors.push('You must accept the Terms of Service to sign up')
  }

  if (errors.length > 0) {
    console.log('🔥', errors)
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: errors.join('\n'),
      life: 3000
    })
  }

  return errors.length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const success = await signup(form.email, form.password, form.confirmPassword, form.tosAccepted)
    if (success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Account created successfully',
        life: 3000
      })
      router.push('/home')
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create account',
        life: 3000
      })
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to create account',
      life: 3000
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>
