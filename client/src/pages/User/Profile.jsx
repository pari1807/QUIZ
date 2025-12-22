import { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getProfile();
        setProfile(res.data);
        updateUser(res.data);
      } catch (err) {
        console.error('Profile fetch error', err);
        setError(err?.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [updateUser]);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p>No profile data.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.username || 'Profile avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl font-semibold">
              {profile.username?.[0]?.toUpperCase() || '?'}
            </span>
          )}
        </div>
        <div>
          <p className="text-xl font-semibold">{profile.username}</p>
          <p className="text-gray-600 text-sm">{profile.email}</p>
          <p className="text-gray-600 text-sm capitalize">Role: {profile.role}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">About</h2>
        <p className="text-gray-700 text-sm whitespace-pre-line">
          {profile.bio || 'No bio added yet.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-xs text-gray-500">Course</p>
          <p className="font-medium">{profile.course || 'Not set'}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-xs text-gray-500">Semester</p>
          <p className="font-medium">{profile.semester || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
