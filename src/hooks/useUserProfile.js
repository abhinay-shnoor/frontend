import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../api/users';

export function useUserProfile() {
  const { user, setUser } = useAuth();

  const profile = {
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar_url || null,
    initials: (user?.name || 'U')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    color: '#0D9488',
    role: user?.role || 'member',
  };

  const saveProfile = async (updated) => {
    try {
      const freshUser = await updateMyProfile(updated.name);
      // Update the auth context so the navbar reflects the change immediately
      setUser(prev => ({ ...prev, name: freshUser.name }));
    } catch (err) {
      console.error('Failed to save profile:', err);
      throw err;
    }
  };

  return { profile, saveProfile };
}