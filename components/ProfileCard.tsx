import React from 'react';
import { Profile } from '../types';

interface ProfileCardProps {
  profile: Profile;
  onCall: (profile: Profile) => void;
  variant?: 'compact' | 'full';
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onCall, variant = 'compact' }) => {
  if (variant === 'full') {
    return (
      <div className="relative h-full w-full rounded-2xl overflow-hidden group shadow-2xl border border-white/10 bg-gray-800">
        <img src={profile.imageUrl} alt={profile.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-start space-y-2">
          <div className="flex items-center space-x-2">
            <h2 className="text-3xl font-bold text-white">{profile.name}, {profile.age}</h2>
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
              {profile.distance}mi
            </span>
          </div>
          <p className="text-gray-300 text-sm line-clamp-2">{profile.bio}</p>
          <button 
            onClick={() => onCall(profile)}
            className="mt-4 w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span>Start Voice Call</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center p-3 bg-gray-800/50 rounded-xl border border-white/5 hover:bg-gray-800 transition-colors">
      <img src={profile.imageUrl} alt={profile.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30" />
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h4 className="text-sm font-semibold text-white truncate">{profile.name}</h4>
          <span className="text-xs text-gray-500">{profile.age}</span>
        </div>
        <p className="text-xs text-gray-400 truncate">{profile.bio}</p>
      </div>
      <button 
        onClick={() => onCall(profile)}
        className="ml-2 p-2 bg-gray-700 hover:bg-green-600 rounded-full text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      </button>
    </div>
  );
};

export default ProfileCard;
