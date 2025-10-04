import React, { useState, useMemo, useRef } from 'react';
import type { Character, User, UserCharacter, Nation, Element, Weapon, Status } from '../types/character';
import { ELEMENT_COLORS, ELEMENT_TEXT_COLORS, STATUS_COLORS } from '../types/character';

interface CharacterTableProps {
  characters: Character[];
  currentUser: User | null;
  onUpdateUserCharacter: (characterId: string, updates: Partial<UserCharacter>) => void;
}

export const CharacterTable: React.FC<CharacterTableProps> = ({
  characters,
  currentUser,
  onUpdateUserCharacter
}) => {
  const [filters, setFilters] = useState({
    nation: '' as Nation | '',
    element: '' as Element | '',
    weapon: '' as Weapon | '',
    rarity: '' as 4 | 5 | '',
    status: '' as Status | ''
  });
  const [sortBy, setSortBy] = useState<keyof Character>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [localWeaponNames, setLocalWeaponNames] = useState<Record<string, string>>({});
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const filteredAndSortedCharacters = useMemo(() => {
    let filtered = characters.filter(char => {
      const userChar = currentUser?.characters[char.id];
      const status = userChar?.status || 'Unowned';
      
      return (
        (!filters.nation || char.nation === filters.nation) &&
        (!filters.element || char.element === filters.element) &&
        (!filters.weapon || char.weapon === filters.weapon) &&
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

  const handleSort = (column: keyof Character) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getUserCharacter = (characterId: string): UserCharacter => {
    return currentUser?.characters[characterId] || {
      characterId,
      status: 'Unowned',
      constellation: 0,
      refinement: 0,
      weaponName: 'N/A'
    };
  };

  const updateCharacter = (characterId: string, updates: Partial<UserCharacter>) => {
    onUpdateUserCharacter(characterId, updates);
  };

  const handleWeaponNameChange = (characterId: string, value: string) => {
    // Update local state immediately for responsive UI
    setLocalWeaponNames(prev => ({
      ...prev,
      [characterId]: value
    }));

    // Clear existing timeout for this character
    if (debounceTimeouts.current[characterId]) {
      clearTimeout(debounceTimeouts.current[characterId]);
    }

    // Set new timeout for debounced update
    debounceTimeouts.current[characterId] = setTimeout(() => {
      onUpdateUserCharacter(characterId, { weaponName: value });
      // Clean up the timeout reference
      delete debounceTimeouts.current[characterId];
    }, 500); // 500ms delay
  };

  const getWeaponNameValue = (characterId: string, userChar: UserCharacter) => {
    return localWeaponNames[characterId] !== undefined 
      ? localWeaponNames[characterId] 
      : userChar.weaponName;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
      {/* Filters */}
      <div className="p-4 md:p-6 border-b border-white/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <select
            value={filters.nation}
            onChange={(e) => setFilters({...filters, nation: e.target.value as Nation | ''})}
            className="p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-genshin-blue"
          >
            <option value="">All Nations</option>
            <option value="Mondstadt">Mondstadt</option>
            <option value="Liyue">Liyue</option>
            <option value="Inazuma">Inazuma</option>
            <option value="Sumeru">Sumeru</option>
            <option value="Fontaine">Fontaine</option>
            <option value="Natlan">Natlan</option>
            <option value="Nod-Krai">Nod-Krai</option>
          </select>

          <select
            value={filters.element}
            onChange={(e) => setFilters({...filters, element: e.target.value as Element | ''})}
            className="p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-genshin-blue"
          >
            <option value="">All Elements</option>
            <option value="Pyro">Pyro</option>
            <option value="Hydro">Hydro</option>
            <option value="Cryo">Cryo</option>
            <option value="Dendro">Dendro</option>
            <option value="Electro">Electro</option>
            <option value="Anemo">Anemo</option>
            <option value="Geo">Geo</option>
          </select>

          <select
            value={filters.weapon}
            onChange={(e) => setFilters({...filters, weapon: e.target.value as Weapon | ''})}
            className="p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-genshin-blue"
          >
            <option value="">All Weapons</option>
            <option value="Sword">Sword</option>
            <option value="Bow">Bow</option>
            <option value="Catalyst">Catalyst</option>
            <option value="Claymore">Claymore</option>
            <option value="Polearm">Polearm</option>
          </select>

          <select
            value={filters.rarity}
            onChange={(e) => setFilters({...filters, rarity: e.target.value as 4 | 5 | ''})}
            className="p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-genshin-blue"
          >
            <option value="">All Rarities</option>
            <option value="4">4★</option>
            <option value="5">5★</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value as Status | ''})}
            className="p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-genshin-blue"
          >
            <option value="">All Statuses</option>
            <option value="Unowned">Unowned</option>
            <option value="WIP">WIP</option>
            <option value="Built">Built</option>
          </select>
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
                className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold cursor-pointer hover:bg-white/20 transition-colors text-sm md:text-base hidden md:table-cell"
                onClick={() => handleSort('nation')}
              >
                Nation {sortBy === 'nation' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold cursor-pointer hover:bg-white/20 transition-colors text-sm md:text-base"
                onClick={() => handleSort('element')}
              >
                Element {sortBy === 'element' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold cursor-pointer hover:bg-white/20 transition-colors text-sm md:text-base hidden lg:table-cell"
                onClick={() => handleSort('weapon')}
              >
                Weapon {sortBy === 'weapon' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold text-sm md:text-base">Status</th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold text-sm md:text-base">Constellation</th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold text-sm md:text-base">Weapon Name</th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-left text-white font-semibold text-sm md:text-base">Refinement</th>
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
                      <span className={`font-medium text-sm md:text-base ${ELEMENT_TEXT_COLORS[character.element]}`}>{character.name}</span>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-white text-sm md:text-base hidden md:table-cell">{character.nation}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${ELEMENT_COLORS[character.element]}`}>
                      {character.element}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-white text-sm md:text-base hidden lg:table-cell">{character.weapon}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <select
                      value={userChar.status}
                      onChange={(e) => updateCharacter(character.id, { status: e.target.value as Status })}
                      className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium text-white border-0 focus:outline-none focus:ring-2 focus:ring-genshin-blue ${STATUS_COLORS[userChar.status]}`}
                    >
                      <option value="Unowned">Unowned</option>
                      <option value="WIP">WIP</option>
                      <option value="Built">Built</option>
                    </select>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    {!isUnowned && (
                      <select
                        value={userChar.constellation}
                        onChange={(e) => updateCharacter(character.id, { constellation: parseInt(e.target.value) })}
                        className="px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-genshin-blue"
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>C{num}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    {!isUnowned ? (
                      <input
                        type="text"
                        value={getWeaponNameValue(character.id, userChar)}
                        onChange={(e) => handleWeaponNameChange(character.id, e.target.value)}
                        placeholder="Enter weapon name"
                        className="px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-genshin-blue w-full min-w-[120px]"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs md:text-sm">--</span>
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    {!isUnowned && (
                      <select
                        value={userChar.refinement}
                        onChange={(e) => updateCharacter(character.id, { refinement: parseInt(e.target.value) })}
                        className="px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-genshin-blue"
                      >
                        {[0, 1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>R{num}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
