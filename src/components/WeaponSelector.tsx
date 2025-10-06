import React, { useState, useRef, useEffect } from 'react';
import { getWeaponsByType, getWeaponByName } from '../data/weaponsData';
import { getWeaponIconUrl } from '../utils/weaponIcons';
import type { WeaponData } from '../types/weapon';
import type { Weapon } from '../types/character';

interface WeaponSelectorProps {
  weaponType: Weapon;
  selectedWeaponName: string;
  onChange: (weaponName: string) => void;
  className?: string;
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  weaponType,
  selectedWeaponName,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get all weapons for this type
  const availableWeapons = getWeaponsByType(weaponType);
  
  // Filter weapons based on search query
  const filteredWeapons = availableWeapons.filter(weapon =>
    weapon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the currently selected weapon data
  const selectedWeapon = selectedWeaponName && selectedWeaponName !== 'N/A' 
    ? getWeaponByName(selectedWeaponName) 
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

  const handleSelect = (weapon: WeaponData) => {
    onChange(weapon.name);
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
      {/* Selected weapon display or button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-genshin-blue"
      >
        {selectedWeapon ? (
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <img
              src={getWeaponIconUrl(selectedWeapon.iconPath)}
              alt={selectedWeapon.name}
              className="w-8 h-8 object-contain flex-shrink-0"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-sm truncate">{selectedWeapon.name}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Select weapon...</span>
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
              placeholder="Search weapons..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-genshin-blue"
            />
          </div>

          {/* Weapons list */}
          <div className="overflow-y-auto max-h-[340px]">
            {filteredWeapons.length > 0 ? (
              filteredWeapons.map((weapon) => (
                <button
                  key={weapon.name}
                  type="button"
                  onClick={() => handleSelect(weapon)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 transition-all duration-150 text-left ${
                    selectedWeapon?.name === weapon.name 
                      ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-white font-medium border-l-2 border-purple-400' 
                      : 'bg-white text-gray-900 hover:bg-gradient-to-r hover:from-purple-300/40 hover:to-pink-300/40 hover:text-white'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={getWeaponIconUrl(weapon.iconPath)}
                      alt={weapon.name}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{weapon.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getRarityColor(weapon.rarity)}`} />
                      <span className={`text-xs ${selectedWeapon?.name === weapon.name ? 'text-gray-200' : 'text-gray-600'}`}>{weapon.rarity}★</span>
                    </div>
                  </div>
                  {selectedWeapon?.name === weapon.name && (
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-gray-400 text-sm">
                No weapons found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

