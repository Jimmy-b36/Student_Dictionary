import { useToastHelper } from '@/composables/toast.helper'
import { pb } from '@/utils/pocketbaseConnection'
import { useRouter } from 'vue-router'
export const useAuthService = () => {
  const toast = useToastHelper()
  const router = useRouter()
  const login = async (email: string, password: string) => {
    try {
      return await pb.collection('teachers').authWithPassword(email, password)
    } catch (error: any) {
      toast.error('Incorrect email or password')
      return false
    }
  }

  const adminLogin = async (email: string, password: string) => {
    try {
      return await pb.admins.authWithPassword(email, password)
    } catch (error: any) {
      toast.error('Incorrect email or password')
      return false
    }
  }

  const signup = async (email: string, password: string, confirmPassword: string, tosAccepted: boolean) => {
    try {
      const authData = await pb
        .collection('teachers')
        .create({ email, password, passwordConfirm: confirmPassword, tosAccepted })
      if (authData) {
        await login(email, password)
        return true
      }
      return false
    } catch (error: any) {
      toast.error(error.message || 'Failed to signup')
      return false
    }
  }

  const logout = async () => {
    try {
      pb.authStore.clear()
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout')
    }
  }

  return {
    login,
    adminLogin,
    signup,
    logout
  }
}
