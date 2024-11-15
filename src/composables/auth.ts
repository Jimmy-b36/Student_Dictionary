import { pb } from '../utils/pocketbaseConnection'
export const useAuth = () => {
  const login = async () => {
    const authData = await pb.admins.authWithPassword(
      'jamie.j.ball@gmail.com',
      'RPU7dcm-fwn8jmp@cqb'
    )
    return authData
  }

  return {
    login
  }
}
