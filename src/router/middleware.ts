import { pb } from '@/utils/pocketbaseConnection'
export const checkAuth = () => {
  const authData = pb.authStore.isValid
  return authData
}
