import React, { useState, useRef, useEffect } from 'react';
import { getAllLightCones, getLightConeByName } from '../data/lightConesData';
import { getLightConeIconUrl } from '../utils/lightConeIcons';
import type { LightConeData } from '../types/light-cone';

interface LightConeSelectorProps {
  selectedLightConeName: string;
  onChange: (lightConeName: string) => void;
  className?: string;
}

export const LightConeSelector: React.FC<LightConeSelectorProps> = ({
  selectedLightConeName,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get all light cones (not filtered by path)
  const availableLightCones = getAllLightCones();
  
  // Filter light cones based on search query
  const filteredLightCones = availableLightCones.filter(lc =>
    lc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the currently selected light cone data
  const selectedLightCone = selectedLightConeName && selectedLightConeName !== 'N/A' 
    ? getLightConeByName(selectedLightConeName) 
    : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (lightCone: LightConeData) => {
    onChange(lightCone.name);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getRarityColor = (rarity: number) => {
    if (rarity === 5) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rarity === 4) return 'bg-gradient-to-r from-purple-400 to-purple-600';
    if (rarity === 3) return 'bg-gradient-to-r from-blue-400 to-blue-600';
    return 'bg-gray-400';
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Selected light cone display or button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-genshin-blue"
      >
        {selectedLightCone ? (
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <img
              src={getLightConeIconUrl(selectedLightCone.iconPath)}
              alt={selectedLightCone.name}
              className="w-8 h-8 object-contain flex-shrink-0"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
              }}
              onLoad={(e) => {
                // Ensure image is visible when it loads successfully
                e.currentTarget.style.display = 'block';
              }}
            />
            <span className="text-sm truncate">{selectedLightCone.name}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Select light cone...</span>
        )}
        <svg
          className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="absolute z-50 mt-2 w-full min-w-[280px] border border-white/30 rounded-lg shadow-xl max-h-[400px] overflow-hidden backdrop-blur-md"
          style={{
            background: 'linear-gradient(135deg, rgba(75, 85, 140, 0.95) 0%, rgba(65, 75, 130, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          {/* Search input */}
          <div className="p-3 border-b border-white/20 sticky top-0" style={{
            background: 'linear-gradient(135deg, rgba(75, 85, 140, 0.95) 0%, rgba(65, 75, 130, 0.95) 100%)'
          }}>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search light cones..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-genshin-blue"
            />
          </div>

          {/* Light cones list */}
          <div className="overflow-y-auto max-h-[340px]">
            {filteredLightCones.length > 0 ? (
              filteredLightCones.map((lc) => (
                <button
                  key={lc.name}
                  type="button"
                  onClick={() => handleSelect(lc)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 transition-all duration-150 text-left ${
                    selectedLightCone?.name === lc.name 
                      ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-white font-medium border-l-2 border-purple-400' 
                      : 'bg-white text-gray-900 hover:bg-gradient-to-r hover:from-purple-300/40 hover:to-pink-300/40 hover:text-white'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={getLightConeIconUrl(lc.iconPath)}
                      alt={lc.name}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        // Ensure image is visible when it loads successfully
                        e.currentTarget.style.display = 'block';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{lc.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getRarityColor(lc.rarity)}`} />
                      <span className={`text-xs ${selectedLightCone?.name === lc.name ? 'text-gray-200' : 'text-gray-600'}`}>{lc.rarity}★</span>
                    </div>
                  </div>
                  {selectedLightCone?.name === lc.name && (
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-gray-400 text-sm">
                No light cones found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

