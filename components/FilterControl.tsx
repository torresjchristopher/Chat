import React, { useState } from 'react';
import { FilterState, Gender } from '../types';

interface FilterControlProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  themeColor: string; // 'blue' | 'rose'
}

const FilterControl: React.FC<FilterControlProps> = ({ filters, setFilters, themeColor }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const accentColor = themeColor === 'rose' ? 'bg-pink-600' : 'bg-blue-600';
  const rangeAccent = themeColor === 'rose' ? 'accent-pink-500' : 'accent-blue-500';
  const textColor = themeColor === 'rose' ? 'text-pink-200' : 'text-blue-200';

  return (
    <div className="w-full bg-black/20 backdrop-blur-sm border-b border-white/10 p-3 transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
        </h3>
        <div className={`${textColor} text-xs`}>
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>
      
      {isExpanded && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-3 animate-fade-in">
          {/* Gender */}
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] uppercase text-gray-400">Gender</label>
            <div className="flex bg-black/30 rounded-lg p-1">
              {[Gender.Any, Gender.Female, Gender.Male].map((g) => (
                <button
                  key={g}
                  onClick={() => setFilters(prev => ({ ...prev, gender: g }))}
                  className={`flex-1 text-[10px] py-1.5 rounded-md transition-all ${
                    filters.gender === g 
                      ? `${accentColor} text-white shadow-sm` 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {g === Gender.Any ? 'All' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Max Age</span>
              <span>{filters.ageRange[1]}</span>
            </div>
            <input 
              type="range" 
              min="18" 
              max="100" 
              value={filters.ageRange[1]} 
              onChange={(e) => setFilters(prev => ({ ...prev, ageRange: [prev.ageRange[0], parseInt(e.target.value)] }))}
              className={`w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer ${rangeAccent}`}
            />
          </div>

          {/* Distance */}
          <div className="flex flex-col space-y-1">
             <div className="flex justify-between text-[10px] text-gray-400">
              <span>Max Distance</span>
              <span>{filters.maxDistance} mi</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={filters.maxDistance}
              onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
              className={`w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer ${rangeAccent}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControl;