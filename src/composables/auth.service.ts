import { pb } from '@/utils/pocketbaseConnection'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
export const useAuthService = () => {
  const toast = useToast()
  const router = useRouter()
  const login = async (email: string, password: string) => {
    try {
      return await pb.collection('teachers').authWithPassword(email, password)
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Incorrect email or password',
        life: 3000
      })
      return false
    }
  }

  const adminLogin = async (email: string, password: string) => {
    try {
      return await pb.admins.authWithPassword(email, password)
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Incorrect email or password',
        life: 3000
      })
      return false
    }
  }

  const signup = async (email: string, password: string, confirmPassword: string) => {
    try {
      const authData = await pb
        .collection('teachers')
        .create({ email, password, passwordConfirm: confirmPassword })
      if (authData) {
        await login(email, password)
        return true
      }
      return false
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to signup',
        life: 3000
      })
      return false
    }
  }

  const logout = async () => {
    try {
      pb.authStore.clear()
      router.push('/login')
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to logout',
        life: 3000
      })
    }
  }

  return {
    login,
    adminLogin,
    signup,
    logout
  }
}
