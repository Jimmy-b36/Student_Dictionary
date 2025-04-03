<template>
  <div>
    <Toast position="top-left" />
    <div v-if="isSignup">
      <Signup>
        <template #toggleLogin v-if="!isAdminRoute">
          <component
            :is="signupButtons['login'].component"
            :class="signupButtons['login'].class"
            @click="toggleSignup"
            data-testid="toggleLoginSlot"
          >
            {{ signupButtons['login'].label }}
          </component>
        </template>
      </Signup>
    </div>
    <div v-else>
      <Login :isAdminLogin="isAdminRoute">
        <template #toggleSignup v-if="!isAdminRoute">
          <component
            :is="signupButtons['signup'].component"
            :class="signupButtons['signup'].class"
            @click="toggleSignup"
            data-testid="toggleSignupSlot"
          >
            {{ signupButtons['signup'].label }}
          </component>
        </template>
      </Login>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
const isSignup = ref(false)
const route = useRoute()
const isAdminRoute = route.name === 'AdminLogin'

const signupButtons = ref({
  login: {
    component: 'button',
    label: 'Have an account? Login.',
    class: 'text-blue-500 mt-4 text-sm cursor-pointer'
  },
  signup: {
    component: 'button',
    label: "Don't have an account? Signup.",
    class: 'text-blue-500 mt-4 text-sm cursor-pointer'
  }
})

const toggleSignup = () => (isSignup.value = !isSignup.value)
</script>
<style lang="scss" scoped></style>
