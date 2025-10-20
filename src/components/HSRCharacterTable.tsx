import React, { useState, useMemo } from 'react';
import type { HSRCharacter, HSRUser, HSRUserCharacter, Path, HSRElement, Status } from '../types/hsr-character';
import { HSR_ELEMENT_TEXT_COLORS } from '../types/hsr-character';
import { CustomDropdown } from './CustomDropdown';
import { LightConeSelector } from './LightConeSelector';
import { getPathIcon } from '../utils/pathIcons';
import { getHSRElementIcon } from '../utils/hsrElementIcons';

interface HSRCharacterTableProps {
  characters: HSRCharacter[];
  currentUser: HSRUser | null;
  onUpdateUserCharacter: (characterId: string, updates: Partial<HSRUserCharacter>) => void;
}

export const HSRCharacterTable: React.FC<HSRCharacterTableProps> = ({
  characters,
  currentUser,
  onUpdateUserCharacter
}) => {
  const [filters, setFilters] = useState({
    path: '' as Path | '',
    element: '' as HSRElement | '',
    rarity: '' as 4 | 5 | '',
    status: '' as Status | ''
  });
  const [sortBy, setSortBy] = useState<keyof HSRCharacter>('version');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedCharacters = useMemo(() => {
    let filtered = characters.filter(char => {
      const userChar = currentUser?.characters[char.id];
      const status = userChar?.status || 'Unowned';
      
      return (
        (!filters.path || char.path === filters.path) &&
        (!filters.element || char.element === filters.element) &&
        (!filters.rarity || char.rarity === filters.rarity) &&
        (!filters.status || status === filters.status)
      );
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];
      
      if (sortBy === 'rarity') {
        aVal = a.rarity;
        bVal = b.rarity;
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [characters, currentUser, filters, sortBy, sortOrder]);

  const handleSort = (column: keyof HSRCharacter) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getUserCharacter = (characterId: string): HSRUserCharacter => {
    return currentUser?.characters[characterId] || {
      characterId,
      status: 'Unowned',
      eidolon: 0,
      superposition: 1,
      lightConeName: 'N/A'
    };
  };

  const updateCharacter = (characterId: string, updates: Partial<HSRUserCharacter>) => {
    onUpdateUserCharacter(characterId, updates);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
      {/* Filters */}
      <div className="p-4 md:p-6 border-b border-white/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <CustomDropdown
            options={[
              { value: '', label: 'All Paths' },
              { value: 'Destruction', label: 'Destruction' },
              { value: 'Hunt', label: 'Hunt' },
              { value: 'Harmony', label: 'Harmony' },
              { value: 'Erudition', label: 'Erudition' },
              { value: 'Nihility', label: 'Nihility' },
              { value: 'Preservation', label: 'Preservation' },
              { value: 'Abundance', label: 'Abundance' },
              { value: 'Remembrance', label: 'Remembrance' }
            ]}
            value={filters.path}
            onChange={(value) => setFilters({...filters, path: value as Path | ''})}
            className="p-2"
          />

          <CustomDropdown
            options={[
              { value: '', label: 'All Elements' },
              { value: 'Physical', label: 'Physical' },
              { value: 'Fire', label: 'Fire' },
              { value: 'Ice', label: 'Ice' },
              { value: 'Lightning', label: 'Lightning' },
              { value: 'Wind', label: 'Wind' },
              { value: 'Quantum', label: 'Quantum' },
              { value: 'Imaginary', label: 'Imaginary' }
            ]}
            value={filters.element}
            onChange={(value) => setFilters({...filters, element: value as HSRElement | ''})}
            className="p-2"
          />

          <CustomDropdown
            options={[
              { value: '', label: 'All Rarities' },
              { value: 4, label: '4★' },
              { value: 5, label: '5★' }
            ]}
            value={filters.rarity}
            onChange={(value) => setFilters({...filters, rarity: value as 4 | 5 | ''})}
            className="p-2"
          />

          <CustomDropdown
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Unowned', label: 'Unowned' },
              { value: 'WIP', label: 'WIP' },
              { value: 'Built', label: 'Built' }
            ]}
            value={filters.status}
            onChange={(value) => setFilters({...filters, status: value as Status | ''})}
            className="p-2"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-white/10">
            <tr>
              <th 
                className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold cursor-pointer hover:bg-white/20 transition-colors text-sm md:text-base"
                onClick={() => handleSort('name')}
              >
                Character {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold cursor-pointer hover:bg-white/20 transition-colors text-sm md:text-base"
                onClick={() => handleSort('path')}
              >
                Path {sortBy === 'path' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold cursor-pointer hover:bg-white/20 transition-colors text-sm md:text-base"
                onClick={() => handleSort('element')}
              >
                Element {sortBy === 'element' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold text-sm md:text-base">Status</th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold text-sm md:text-base">Eidolon</th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold text-sm md:text-base">Light Cone</th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold text-sm md:text-base">Superposition</th>
              <th 
                className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold cursor-pointer hover:bg-white/20 transition-colors text-sm md:text-base"
                onClick={() => handleSort('version')}
              >
                Version {sortBy === 'version' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedCharacters.map((character) => {
              const userChar = getUserCharacter(character.id);
              const isUnowned = userChar.status === 'Unowned';
              
              return (
                <tr key={character.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                        character.rarity === 5 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-purple-400 to-purple-600'
                      }`} />
                      <span className={`font-medium text-sm md:text-base ${HSR_ELEMENT_TEXT_COLORS[character.element]}`}>{character.name}</span>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <img 
                      src={getPathIcon(character.path)} 
                      alt={character.path}
                      title={character.path}
                      className="w-6 h-6 md:w-8 md:h-8 object-contain"
                    />
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <img 
                      src={getHSRElementIcon(character.element)} 
                      alt={character.element}
                      title={character.element}
                      className="w-6 h-6 md:w-8 md:h-8 object-contain"
                    />
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <CustomDropdown
                      options={[
                        { value: 'Unowned', label: 'Unowned' },
                        { value: 'WIP', label: 'WIP' },
                        { value: 'Built', label: 'Built' }
                      ]}
                      value={userChar.status}
                      onChange={(value) => updateCharacter(character.id, { status: value as Status })}
                      className="min-w-[100px]"
                    />
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    {!isUnowned && (
                      <CustomDropdown
                        options={[0, 1, 2, 3, 4, 5, 6].map(num => ({
                          value: num,
                          label: `E${num}`
                        }))}
                        value={userChar.eidolon}
                        onChange={(value) => updateCharacter(character.id, { eidolon: value as number })}
                        className="min-w-[80px]"
                      />
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    {!isUnowned ? (
                      <LightConeSelector
                        selectedLightConeName={userChar.lightConeName}
                        onChange={(lightConeName) => updateCharacter(character.id, { lightConeName })}
                        className="min-w-[200px]"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs md:text-sm">--</span>
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    {!isUnowned && (
                      <CustomDropdown
                        options={[1, 2, 3, 4, 5].map(num => ({
                          value: num,
                          label: `S${num}`
                        }))}
                        value={userChar.superposition}
                        onChange={(value) => updateCharacter(character.id, { superposition: value as number })}
                        className="min-w-[80px]"
                      />
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-white text-sm md:text-base">{character.version}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

