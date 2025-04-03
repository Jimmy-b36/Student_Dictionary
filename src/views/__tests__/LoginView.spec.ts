import Login from '@/components/auth/Login.vue' // Child component
import Signup from '@/components/auth/Signup.vue' // Child component
import { RouterLinkStub, shallowMount, VueWrapper } from '@vue/test-utils' // Or mount
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginView from '../../views/LoginView.vue' // Component to test

// Mock child components for shallow mounting
const MockLogin = {
  template: '<div data-testid="login-component"><slot name="toggleSignup" ></slot></div>',
  props: ['isAdminLogin'] // Define props it accepts
}
const MockSignup = {
  template: '<div data-testid="signup-component" ></div>'
}

// Mock vue-router
const mockRoute = { name: 'Login' } // Default mock route
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => mockRoute),
  useRouter: vi.fn(() => ({ push: vi.fn() })) // Mock useRouter if needed
}))

describe('LoginView.vue', () => {
  let wrapper: VueWrapper<any>

  const createWrapper = (routeName = 'Login') => {
    mockRoute.name = routeName // Set the desired route name for the test
    wrapper = shallowMount(LoginView, {
      global: {
        stubs: {
          // Explicitly stub children
          Login: MockLogin,
          Signup: MockSignup,

          // Stub PrimeVue components used directly in LoginView (if any)
          Button: { template: '<button><slot/></button>' } // Stub button used for toggle
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Login component by default on Login route', () => {
    createWrapper('Login')
    expect(wrapper.findComponent(MockLogin).exists()).toBe(true)
    expect(wrapper.findComponent(MockSignup).exists()).toBe(false)
    expect(wrapper.findComponent(MockLogin).props('isAdminLogin')).toBe(false)
  })

  it('renders Login component with isAdminLogin true on AdminLogin route', () => {
    createWrapper('AdminLogin')
    expect(wrapper.findComponent(MockLogin).exists()).toBe(true)
    expect(wrapper.findComponent(MockSignup).exists()).toBe(false)
    expect(wrapper.findComponent(MockLogin).props('isAdminLogin')).toBe(true)
  })

  it('renders Signup component when toggle link is clicked (on Login route)', async () => {
    createWrapper('Login')
    const toggleButton = wrapper.find('[data-testid=toggleSignupSlot]')
    expect(toggleButton.exists()).toBe(true)

    await toggleButton.trigger('click')

    expect(wrapper.findComponent(MockLogin).exists()).toBe(false)
    expect(wrapper.findComponent(MockSignup).exists()).toBe(true)
  })

  it('does not render toggle link on AdminLogin route', () => {
    createWrapper('AdminLogin')

    const toggleButton = wrapper.find('[data-testid=toggleSignupSlot]')
    expect(toggleButton.exists()).toBe(false)
  })
})
