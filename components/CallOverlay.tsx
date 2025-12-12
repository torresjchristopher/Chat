import React, { useEffect, useState } from 'react';
import { Profile } from '../types';
import { geminiLive } from '../services/liveClient';

interface CallOverlayProps {
  profile: Profile;
  onEndCall: () => void;
}

const CallOverlay: React.FC<CallOverlayProps> = ({ profile, onEndCall }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Generate system instruction based on the profile persona
    const systemInstruction = `You are roleplaying as ${profile.name}, a ${profile.age} year old ${profile.gender} who describes themselves as "${profile.bio}". You are currently on a voice call with a new match on a dating app. Be engaging, flirtatious if appropriate, and conversational. Keep responses relatively short and natural for a voice conversation.`;
    
    // Connect to live service
    geminiLive.connect({
      systemInstruction,
      onAudioData: (speaking) => setIsSpeaking(speaking)
    }).catch(err => {
      console.error("Failed to connect", err);
      // Don't auto-close immediately, give user feedback
      alert("Microphone permission is required or connection failed. Please tap 'Start Voice Call' again.");
      onEndCall();
    });

    const timer = setInterval(() => setDuration(d => d + 1), 1000);

    return () => {
      geminiLive.disconnect();
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-4 animate-fade-in overflow-hidden">
      {/* Background Blur Image */}
      <div className="absolute inset-0 z-0">
        <img src={profile.imageUrl} alt="" className="w-full h-full object-cover blur-3xl opacity-30" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="z-10 flex flex-col items-center space-y-6 w-full max-w-md h-full justify-center">
        <div className="relative shrink-0">
          {/* Pulse Effect when speaking */}
          {isSpeaking && (
            <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-75"></div>
          )}
          <img 
            src={profile.imageUrl} 
            alt={profile.name} 
            className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/20 shadow-2xl"
          />
        </div>

        <div className="text-center shrink-0">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{profile.name}</h2>
          <p className="text-pink-300 font-medium text-sm md:text-base">{isSpeaking ? 'Speaking...' : 'Listening...'}</p>
          <p className="text-gray-400 mt-1 text-xs md:text-sm font-mono">{formatTime(duration)}</p>
        </div>

        {/* Audio Visualizer Mock */}
        <div className="flex items-center justify-center space-x-1 h-8 shrink-0">
           {[...Array(5)].map((_, i) => (
             <div 
               key={i} 
               className={`w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full transition-all duration-300 ${isSpeaking ? 'animate-pulse' : ''}`}
               style={{ 
                 height: isSpeaking ? `${Math.random() * 30 + 10}px` : '4px',
                 animationDelay: `${i * 0.1}s`
               }} 
             />
           ))}
        </div>

        <button 
          onClick={onEndCall}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-4 md:p-6 shadow-lg transform transition hover:scale-105 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CallOverlay;