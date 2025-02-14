import { pb } from '../utils/pocketbaseConnection'
export const useAuth = () => {
  const login = async (email: string, password: string) => {
    let authData
    try {
      authData = await pb.admins.authWithPassword(email, password)
      if (authData) {
        return authData
      }

      authData = await pb.collection('users').authWithPassword(email, password)
      return authData
    } catch (error) {
      console.log('🚀 ~ login ~ error:', error)
    }
  }

  const signup = async (email: string, password: string) => {
    try {
      const authData = await pb.admins.create({ email, password })
      return authData
    } catch (error) {
      console.log('🚀 ~ signup ~ error:', error)
    }
  }

  const logout = async () => {
    try {
      await pb.authStore.clear()
    } catch (error) {
      console.log('🚀 ~ logout ~ error:', error)
    }
  }

  return {
    login,
    signup,
    logout
  }
}
