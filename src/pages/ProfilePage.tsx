import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Check } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Logo from '../components/common/Logo';

interface AvatarOption {
  id: string;
  url: string;
}

const defaultAvatars: AvatarOption[] = [
  { id: '1', url: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', url: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', url: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', url: 'https://i.pravatar.cc/150?img=4' },
  { id: '5', url: 'https://i.pravatar.cc/150?img=5' },
  { id: '6', url: 'https://i.pravatar.cc/150?img=6' },
  { id: '7', url: 'https://i.pravatar.cc/150?img=7' },
  { id: '8', url: 'https://i.pravatar.cc/150?img=8' }
];

const ProfilePage = () => {
  const { user, selectProfile, updateProfile, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const navigate = useNavigate();

  const handleProfileSelect = (profile: any) => {
    if (isEditing) {
      setSelectedProfile(profile);
      setShowAvatarSelector(true);
      return;
    }
    
    selectProfile(profile);
    navigate('/browse');
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    if (!selectedProfile) return;

    try {
      await updateProfile(selectedProfile.id, {
        ...selectedProfile,
        avatar: avatarUrl
      });
      setShowAvatarSelector(false);
      setSelectedProfile(null);
      setCustomAvatarUrl('');
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleCustomAvatarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAvatarUrl) return;

    const isValid = validateUrl(customAvatarUrl);
    setIsValidUrl(isValid);

    if (isValid) {
      handleAvatarSelect(customAvatarUrl);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (showAvatarSelector) {
    return (
      <div className="min-h-screen bg-netflix-black flex flex-col">
        <header className="p-6">
          <Logo />
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="max-w-4xl w-full bg-netflix-dark/50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Choose an avatar</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
              {defaultAvatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar.url)}
                  className="relative group"
                >
                  <img
                    src={avatar.url}
                    alt={`Avatar ${avatar.id}`}
                    className="w-full aspect-square object-cover rounded-lg transition transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg">
                    <Check className="text-white" size={32} />
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4">Use custom avatar URL</h3>
              <form onSubmit={handleCustomAvatarSubmit} className="space-y-4">
                <div>
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="Enter image URL (https://...)"
                    className={`w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 ${
                      isValidUrl ? 'focus:ring-netflix-red' : 'focus:ring-red-500 border-red-500'
                    }`}
                  />
                  {!isValidUrl && (
                    <p className="text-red-500 text-sm mt-1">
                      Please enter a valid image URL (must start with http:// or https://)
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAvatarSelector(false);
                      setSelectedProfile(null);
                      setCustomAvatarUrl('');
                    }}
                    className="px-6 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!customAvatarUrl}
                    className="px-6 py-2 bg-netflix-red rounded-md hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black flex flex-col">
      <header className="p-6">
        <Logo />
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl md:text-3xl text-netflix-white mb-6">
          {isEditing ? 'Manage Profiles' : 'Who\'s watching?'}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
          {user?.profiles.map((profile) => (
            <div 
              key={profile.id}
              className="relative group"
              onClick={() => handleProfileSelect(profile)}
            >
              <div className={`w-[120px] h-[120px] overflow-hidden rounded-md transition-all duration-300 ${
                isEditing ? 'opacity-50' : 'cursor-pointer hover:border-4 border-netflix-white'
              }`}>
                <img 
                  src={profile.avatar} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Pencil className="text-netflix-white" size={40} />
                </div>
              )}
              <p className="text-center text-netflix-gray mt-2 group-hover:text-netflix-white">
                {profile.name}
              </p>
            </div>
          ))}
          
          {/* Add profile button */}
          <div 
            className="w-[120px] h-[120px] flex flex-col items-center justify-center border-2 border-gray-600 rounded-md text-gray-600 cursor-pointer hover:border-netflix-white hover:text-netflix-white transition-all duration-300"
            onClick={() => {
              // In a real app, this would open a modal to add a new profile
              alert('Add profile functionality would go here');
            }}
          >
            <Plus size={40} />
            <p className="text-center mt-2">Add Profile</p>
          </div>
        </div>
        
        <div className="mt-12">
          {isEditing ? (
            <button 
              onClick={() => setIsEditing(false)}
              className="py-2 px-8 bg-netflix-white text-netflix-black border border-netflix-white rounded font-medium hover:bg-netflix-white/90 transition-colors"
            >
              Done
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="py-2 px-8 border border-gray-600 text-gray-600 rounded font-medium hover:border-netflix-white hover:text-netflix-white transition-colors"
            >
              Manage Profiles
            </button>
          )}
        </div>
        
        <button 
          onClick={handleLogout}
          className="mt-4 text-gray-600 hover:text-netflix-white transition-colors"
        >
          Sign Out
        </button>
      </main>
    </div>
  );
};

export default ProfilePage;