import { pb } from '../utils/pocketbaseConnection'
export const useAuth = () => {
  const login = async () => {
    const authData = await pb.admins.authWithPassword(
      import.meta.env.VITE_POCKETBASE_EMAIL,
      import.meta.env.VITE_POCKETBASE_PASSWORD
    )
    return authData
  }

  return {
    login
  }
}
