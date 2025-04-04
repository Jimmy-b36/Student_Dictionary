import Login from '@/components/auth/Login.vue' // Component to test
import { useAuthService } from '@/composables/auth.service' // Mock this
import { shallowMount, VueWrapper } from '@vue/test-utils'
import ToastService from 'primevue/toastservice' // Import ToastService
import { beforeEach, describe, expect, it, vi } from 'vitest'

// --- Mock useAuthService ---
const mockLogin = vi.fn()
const mockAdminLogin = vi.fn()
vi.mock('@/composables/auth.service', () => ({
  useAuthService: vi.fn(() => ({
    login: mockLogin,
    adminLogin: mockAdminLogin
  }))
}))

// --- Mock vue-router ---
const mockRouterPush = vi.fn()
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ name: 'Login' })), // Mock route if needed
  useRouter: vi.fn(() => ({ push: mockRouterPush }))
}))

// --- Mock PrimeVue Components ---
// Simple stubs to avoid warnings/errors during shallowMount
const InputText = {
  template:
    '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  props: ['modelValue'],
  emits: ['update:modelValue']
}
// More accurate Password stub reflecting props
const Password = {
  template:
    '<input type="password" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  props: ['modelValue', 'feedback', 'inputClass'],
  emits: ['update:modelValue']
}
const Button = { template: '<button><slot /></button>' }
const Toast = { template: '<div></div>' }

describe('Login.vue', () => {
  let wrapper: VueWrapper<any>

  const createWrapper = (isAdminLoginProp = false) => {
    wrapper = shallowMount(Login, {
      props: {
        isAdminLogin: isAdminLoginProp
      },
      global: {
        plugins: [ToastService], // Add ToastService plugin here
        stubs: {
          // Stub PrimeVue components used
          InputText,
          Password,
          Button,
          Toast
        }
        // Mock provide for things like useToast if needed
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders user login title when isAdminLogin is false', () => {
    createWrapper(false)
    expect(wrapper.find('h1').text()).toContain('Login')
    expect(wrapper.find('h1').text()).not.toContain('Admin')
  })

  it('renders admin login title when isAdminLogin is true', () => {
    createWrapper(true)
    expect(wrapper.find('h1').text()).toContain('Admin Login')
    // Check slot doesn't exist
    expect(wrapper.find('[data-testid=toggleSignupSlot]').exists()).toBe(false)
  })

  it('calls user login on submit when isAdminLogin is false', async () => {
    createWrapper(false)
    mockLogin.mockResolvedValueOnce(true) // Simulate successful login

    // Simulate form input
    await wrapper.find('input[type="email"]').setValue('test@user.com')
    // Use the Password stub's emit mechanism
    await wrapper.findComponent(Password).vm.$emit('update:modelValue', 'password')

    await wrapper.find('form').trigger('submit.prevent')

    expect(mockLogin).toHaveBeenCalledWith('test@user.com', 'password')
    expect(mockAdminLogin).not.toHaveBeenCalled()
    // Wait for potential async updates after submit if needed
    await wrapper.vm.$nextTick() // Allow promises to resolve
    await wrapper.vm.$nextTick() // Extra tick sometimes needed
    expect(mockRouterPush).toHaveBeenCalledWith('/home')
  })

  it('calls admin login on submit when isAdminLogin is true', async () => {
    createWrapper(true)
    mockAdminLogin.mockResolvedValueOnce(true) // Simulate successful admin login

    await wrapper.find('input[type="email"]').setValue('test@admin.com')
    await wrapper.findComponent(Password).vm.$emit('update:modelValue', 'adminpass')
    await wrapper.find('form').trigger('submit.prevent')

    expect(mockAdminLogin).toHaveBeenCalledWith('test@admin.com', 'adminpass')
    expect(mockLogin).not.toHaveBeenCalled()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(mockRouterPush).toHaveBeenCalledWith('/home')
  })

  it('does not redirect if login fails', async () => {
    createWrapper(false)
    mockLogin.mockResolvedValueOnce(false) // Simulate failed login

    await wrapper.find('input[type="email"]').setValue('test@user.com')
    await wrapper.findComponent(Password).vm.$emit('update:modelValue', 'wrong')
    await wrapper.find('form').trigger('submit.prevent')

    expect(mockLogin).toHaveBeenCalledWith('test@user.com', 'wrong')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(mockRouterPush).not.toHaveBeenCalled()
  })
})

// Add data-testid to the slot in Login.vue template for easier selection:
// <slot v-if="!props.isAdminLogin" name="toggleSignup" data-testid="toggleSignupSlot"></slot>
