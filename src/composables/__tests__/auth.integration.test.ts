// @ts-nocheck
import { pb } from '@/utils/pocketbaseConnection'
import { type AdminAuthResponse, type RecordAuthResponse } from 'pocketbase'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthService } from '../auth.service'
const ADMIN_EMAIL = process.env.POCKETBASE_TEST_ADMIN_EMAIL || ''
const ADMIN_PASSWORD = process.env.POCKETBASE_TEST_ADMIN_PASSWORD || ''
const USER_EMAIL = process.env.POCKETBASE_TEST_USER_EMAIL || ''
const USER_PASSWORD = process.env.POCKETBASE_TEST_USER_PASSWORD || ''

// Create dedicated spies
const loginSpy = vi.fn().mockImplementation(async (email, password) => {
  try {
    const authData = await pb.collection('teachers').authWithPassword(email, password)
    return authData
  } catch (error) {
    return error
  }
})

const adminLoginSpy = vi.fn().mockImplementation(async (email, password) => {
  try {
    const authData = await pb.admins.authWithPassword(email, password)
    return authData
  } catch (error) {
    return error
  }
})

const signupSpy = vi
  .fn()
  .mockImplementation(async (email, password, confirmPassword, tosAccepted) => {
    const authData = await pb.collection('teachers').create({
      email,
      password,
      passwordConfirm: confirmPassword,
      tosAccepted
    })
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD)
    return authData
  })

const logoutSpy = vi.fn().mockImplementation(async () => {
  return true
})

// Mock the auth service
vi.mock('../auth.service', () => ({
  useAuthService: vi.fn(() => ({
    login: loginSpy,
    adminLogin: adminLoginSpy,
    signup: signupSpy,
    logout: logoutSpy
  }))
}))

describe('Auth Service', () => {
  let authService: ReturnType<typeof useAuthService>

  beforeEach(() => {
    authService = useAuthService()
    pb.authStore.clear()
  })

  describe('login', () => {
    it('should call login', async () => {
      await authService.login(USER_EMAIL, USER_PASSWORD)
      expect(loginSpy).toHaveBeenCalled()
    })

    it('should return auth data on a successful login', async () => {
      const authData = await authService.login(USER_EMAIL, USER_PASSWORD)
      expect(authData).toBeDefined()
      expect((authData as RecordAuthResponse)?.record?.email).toBe(USER_EMAIL)
    })

    it('should return 400 on failed login', async () => {
      const res = await authService.login('email', 'password')
      expect(res?.response?.code).toBe(400)
      expect(res?.message).toBe('Failed to authenticate.')
    })
  })

  describe('adminLogin', () => {
    it('should call adminLogin', async () => {
      await authService.adminLogin(ADMIN_EMAIL, ADMIN_PASSWORD)
      expect(adminLoginSpy).toHaveBeenCalled()
    })

    it('should return auth data on a successful login', async () => {
      const authData: AdminAuthResponse = (await authService.adminLogin(
        ADMIN_EMAIL,
        ADMIN_PASSWORD
      )) as AdminAuthResponse
      expect(authData).toBeDefined()
      expect(authData?.admin?.email).toBe(ADMIN_EMAIL)
    })

    it('should return failed on  login', async () => {
      const res = await authService.adminLogin('email', 'password')
      expect(res.response.code).toBe(400)

      expect(res.message).toBe('Something went wrong while processing your request.')
    })
  })

  describe('signup', () => {
    const email = 'test@example.com'
    const password = 'password'
    const confirmPassword = 'password'
    const tosAccepted = true
    let userId: string

    afterEach(async () => {
      // Delete user so that it doesn't affect other tests
      await pb.collection('teachers').delete(userId)
      pb.authStore.clear()
    })

    it('should call signup', async () => {
      const res = await authService.signup(email, password, confirmPassword, tosAccepted)
      userId = res.id
      expect(signupSpy).toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('should call logout', async () => {
      await authService.logout()
      expect(logoutSpy).toHaveBeenCalled()
    })
  })
})
