import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_FILTERS, PORTRAIT_PROFILES, LANDSCAPE_PROFILES } from './constants';
import { FilterState, Gender, Profile } from './types';
import FilterControl from './components/FilterControl';
import ProfileCard from './components/ProfileCard';
import CallOverlay from './components/CallOverlay';
import Onboarding from './components/Onboarding';

const App: React.FC = () => {
  const [isLandscape, setIsLandscape] = useState(window.matchMedia("(orientation: landscape)").matches);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [activeCallProfile, setActiveCallProfile] = useState<Profile | null>(null);
  const [userData, setUserData] = useState<{name: string, age: number} | null>(null);

  // Handle Orientation Change
  useEffect(() => {
    const mediaQuery = window.matchMedia("(orientation: landscape)");
    const handleOrientationChange = (e: MediaQueryListEvent) => {
      setIsLandscape(e.matches);
      setFilters(INITIAL_FILTERS);
    };
    mediaQuery.addEventListener("change", handleOrientationChange);
    return () => mediaQuery.removeEventListener("change", handleOrientationChange);
  }, []);

  // Theme Config based on Orientation
  const theme = useMemo(() => {
    return isLandscape ? {
      name: 'rose',
      bg: 'bg-gradient-to-br from-rose-950 via-gray-900 to-indigo-950',
      boxBg: 'bg-rose-900/20',
      borderColor: 'border-rose-500/20',
      headerGradient: 'from-pink-400 to-rose-300',
      headerGradientContact: 'from-orange-400 to-pink-300',
      accentColor: 'text-pink-400'
    } : {
      name: 'blue',
      bg: 'bg-gradient-to-br from-slate-900 via-gray-900 to-blue-950',
      boxBg: 'bg-slate-800/40',
      borderColor: 'border-blue-500/10',
      headerGradient: 'from-blue-400 to-cyan-300',
      headerGradientContact: 'from-indigo-400 to-blue-300',
      accentColor: 'text-blue-400'
    };
  }, [isLandscape]);

  // Profile Pool Logic
  const activePool = isLandscape ? LANDSCAPE_PROFILES : PORTRAIT_PROFILES;

  // Filter Logic
  const filteredProfiles = useMemo(() => {
    return activePool.filter(p => {
      const matchesGender = filters.gender === Gender.Any || p.gender === filters.gender;
      const matchesAge = p.age >= filters.ageRange[0] && p.age <= filters.ageRange[1];
      const matchesDistance = p.distance <= filters.maxDistance;

      if (p.isEstablished) return true; 
      return matchesGender && matchesAge && matchesDistance;
    });
  }, [filters, activePool]);

  const establishedContacts = filteredProfiles.filter(p => p.isEstablished);
  const discoverableUsers = filteredProfiles.filter(p => !p.isEstablished);

  if (!userData) {
    return <Onboarding onComplete={setUserData} />;
  }

  return (
    <div className={`h-full w-full ${theme.bg} text-white relative transition-colors duration-1000`}>
      {/* Main Layout Container */}
      <div className={`h-full flex ${isLandscape ? 'flex-row' : 'flex-col'} p-4 gap-4`}>
        
        {/* --- SECTION A: Established Contacts (Top/Left Box) --- */}
        <div className={`
          ${isLandscape ? 'w-1/3 border-r' : 'h-1/2 border-b'} 
          ${theme.boxBg} backdrop-blur-sm rounded-2xl ${theme.borderColor} border flex flex-col relative overflow-hidden transition-all duration-500 ease-in-out
        `}>
           <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.headerGradientContact} z-10`} />
           
           <div className="p-4 pb-2 flex justify-between items-center">
             <h2 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${theme.headerGradientContact}`}>
               {isLandscape ? 'Matches' : 'Contacts'}
             </h2>
             <span className="text-xs bg-black/40 px-2 py-1 rounded-full text-gray-300">{establishedContacts.length}</span>
           </div>
           
           <div className="px-4 pb-2">
             <div className="text-xs text-gray-400">Welcome, {userData.name}</div>
           </div>

           <div className="overflow-y-auto no-scrollbar p-4 pt-2 space-y-3 flex-1">
             {establishedContacts.map(profile => (
               <ProfileCard 
                 key={profile.id} 
                 profile={profile} 
                 onCall={setActiveCallProfile} 
               />
             ))}
             {establishedContacts.length === 0 && (
               <div className="text-center text-gray-500 mt-10">
                  {isLandscape ? 'No matches yet.' : 'No contacts found.'}
               </div>
             )}
           </div>

           {/* Call Overlay for Established Contacts */}
           {activeCallProfile?.isEstablished && (
             <CallOverlay 
               profile={activeCallProfile} 
               onEndCall={() => setActiveCallProfile(null)} 
             />
           )}
        </div>

        {/* --- SECTION B: Discovery & Filters (Lower/Right Box) --- */}
        <div className={`
          ${isLandscape ? 'w-2/3' : 'h-1/2'} 
          flex flex-col rounded-2xl transition-all duration-500 ease-in-out gap-4 relative
        `}>
           
           {/* Discovery Area */}
           <div className={`
              flex-1 ${theme.boxBg} backdrop-blur-sm rounded-2xl border ${theme.borderColor} relative overflow-hidden flex flex-col
           `}>
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.headerGradient} z-10`} />
              
              {/* EMBEDDED FILTERS: Always embedded now */}
              <div className="relative z-20">
                <FilterControl 
                  filters={filters} 
                  setFilters={setFilters} 
                  themeColor={theme.name}
                />
              </div>

              <div className="p-4 pb-2 flex justify-between items-center">
                 <h2 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${theme.headerGradient}`}>
                   {isLandscape ? 'Find a Date' : 'Discover'}
                 </h2>
                 <span className="text-xs bg-black/40 px-2 py-1 rounded-full text-gray-300">{discoverableUsers.length}</span>
              </div>

              {/* Landscape Transformation: "Dating App Mode" (Large Cards) vs Portrait (List) */}
              {isLandscape ? (
                <div className="flex-1 p-4 overflow-x-auto overflow-y-hidden whitespace-nowrap snap-x snap-mandatory flex gap-6 no-scrollbar items-center px-8">
                   {discoverableUsers.map(profile => (
                     <div key={profile.id} className="w-[300px] h-[90%] inline-block snap-center shrink-0 transition-transform hover:scale-[1.02]">
                        <ProfileCard 
                          profile={profile} 
                          onCall={setActiveCallProfile} 
                          variant="full"
                        />
                     </div>
                   ))}
                   {discoverableUsers.length === 0 && (
                      <div className="w-full text-center text-gray-400">Adjust filters to see more people</div>
                   )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 grid grid-cols-1 gap-3">
                  {discoverableUsers.map(profile => (
                    <ProfileCard 
                      key={profile.id} 
                      profile={profile} 
                      onCall={setActiveCallProfile} 
                    />
                  ))}
                  {discoverableUsers.length === 0 && (
                     <div className="text-center text-gray-500 mt-10">No users match your filters</div>
                  )}
                </div>
              )}

              {/* Call Overlay for Discovery Users */}
              {activeCallProfile && !activeCallProfile.isEstablished && (
                <CallOverlay 
                  profile={activeCallProfile} 
                  onEndCall={() => setActiveCallProfile(null)} 
                />
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;