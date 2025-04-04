import Signup from '@/components/auth/Signup.vue'
import { useAuthService } from '@/composables/auth.service'
import { shallowMount, VueWrapper } from '@vue/test-utils'
import ToastService from 'primevue/toastservice'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock useAuthService
const mockSignup = vi.fn()
vi.mock('@/composables/auth.service', () => ({
  useAuthService: vi.fn(() => ({
    signup: mockSignup
  }))
}))

// Mock useToast
const mockAdd = vi.fn()
vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => ({
    add: mockAdd
  }))
}))

// Mock vue-router
const mockRouterPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: mockRouterPush }))
}))

// Stub PrimeVue components
const InputText = {
  template:
    '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  props: ['modelValue'],
  emits: ['update:modelValue']
}

const Password = {
  template:
    '<input type="password" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  props: ['modelValue', 'feedback', 'toggleMask', 'inputClass'],
  emits: ['update:modelValue']
}

const Button = {
  template: '<button><slot /></button>',
  props: ['label', 'disabled']
}

describe('Signup.vue', () => {
  let wrapper: VueWrapper<any>

  const createWrapper = () => {
    wrapper = shallowMount(Signup, {
      global: {
        plugins: [ToastService],
        stubs: {
          InputText,
          Password,
          Button
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    createWrapper()
  })

  it('renders properly with correct title', () => {
    expect(wrapper.find('h1').text()).toBe('Create Account')
  })

  it('validates email format', async () => {
    await wrapper.find('input[type="email"]').setValue('invalid-email')
    await wrapper.findAllComponents(Password)[0].vm.$emit('update:modelValue', 'password123')
    await wrapper.findAllComponents(Password)[1].vm.$emit('update:modelValue', 'password123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(mockSignup).not.toHaveBeenCalled()
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Validation Error'
      })
    )
  })

  it('validates password length', async () => {
    await wrapper.find('input[type="email"]').setValue('valid@email.com')
    await wrapper.findAllComponents(Password)[0].vm.$emit('update:modelValue', 'short')
    await wrapper.findAllComponents(Password)[1].vm.$emit('update:modelValue', 'short')

    await wrapper.find('form').trigger('submit.prevent')

    expect(mockSignup).not.toHaveBeenCalled()
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error'
      })
    )
  })

  it('validates password matching', async () => {
    await wrapper.find('input[type="email"]').setValue('valid@email.com')
    await wrapper.findAllComponents(Password)[0].vm.$emit('update:modelValue', 'password123')
    await wrapper.findAllComponents(Password)[1].vm.$emit('update:modelValue', 'different123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(mockSignup).not.toHaveBeenCalled()
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error'
      })
    )
  })

  it('calls signup service with correct params on valid submission', async () => {
    mockSignup.mockResolvedValueOnce(true)

    await wrapper.find('input[type="email"]').setValue('valid@email.com')
    await wrapper.findAllComponents(Password)[0].vm.$emit('update:modelValue', 'password123')
    await wrapper.findAllComponents(Password)[1].vm.$emit('update:modelValue', 'password123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(mockSignup).toHaveBeenCalledWith('valid@email.com', 'password123', 'password123')
    await wrapper.vm.$nextTick()
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: 'Success'
      })
    )
    expect(mockRouterPush).toHaveBeenCalledWith('/login')
  })

  it('shows error toast on signup failure', async () => {
    mockSignup.mockResolvedValueOnce(false)

    await wrapper.find('input[type="email"]').setValue('valid@email.com')
    await wrapper.findAllComponents(Password)[0].vm.$emit('update:modelValue', 'password123')
    await wrapper.findAllComponents(Password)[1].vm.$emit('update:modelValue', 'password123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(mockSignup).toHaveBeenCalled()
    await wrapper.vm.$nextTick()
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create account'
      })
    )
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it('handles exceptions during signup', async () => {
    const errorMessage = 'Network error'
    mockSignup.mockRejectedValueOnce(new Error(errorMessage))

    await wrapper.find('input[type="email"]').setValue('valid@email.com')
    await wrapper.findAllComponents(Password)[0].vm.$emit('update:modelValue', 'password123')
    await wrapper.findAllComponents(Password)[1].vm.$emit('update:modelValue', 'password123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(mockSignup).toHaveBeenCalled()
    await wrapper.vm.$nextTick()
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      })
    )
  })
})
