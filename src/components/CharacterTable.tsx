import React, { useState, useMemo } from 'react';
import type { Character, User, UserCharacter, Nation, Element, Weapon, Status } from '../types/character';
import { ELEMENT_COLORS, ELEMENT_TEXT_COLORS } from '../types/character';
import { CustomDropdown } from './CustomDropdown';
import { WeaponSelector } from './WeaponSelector';

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
  const [sortBy, setSortBy] = useState<keyof Character>('version');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
      {/* Filters */}
      <div className="p-4 md:p-6 border-b border-white/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <CustomDropdown
            options={[
              { value: '', label: 'All Nations' },
              { value: 'Mondstadt', label: 'Mondstadt' },
              { value: 'Liyue', label: 'Liyue' },
              { value: 'Inazuma', label: 'Inazuma' },
              { value: 'Sumeru', label: 'Sumeru' },
              { value: 'Fontaine', label: 'Fontaine' },
              { value: 'Natlan', label: 'Natlan' },
              { value: 'Nod-Krai', label: 'Nod-Krai' }
            ]}
            value={filters.nation}
            onChange={(value) => setFilters({...filters, nation: value as Nation | ''})}
            className="p-2"
          />

          <CustomDropdown
            options={[
              { value: '', label: 'All Elements' },
              { value: 'Pyro', label: 'Pyro' },
              { value: 'Hydro', label: 'Hydro' },
              { value: 'Cryo', label: 'Cryo' },
              { value: 'Dendro', label: 'Dendro' },
              { value: 'Electro', label: 'Electro' },
              { value: 'Anemo', label: 'Anemo' },
              { value: 'Geo', label: 'Geo' }
            ]}
            value={filters.element}
            onChange={(value) => setFilters({...filters, element: value as Element | ''})}
            className="p-2"
          />

          <CustomDropdown
            options={[
              { value: '', label: 'All Weapons' },
              { value: 'Sword', label: 'Sword' },
              { value: 'Bow', label: 'Bow' },
              { value: 'Catalyst', label: 'Catalyst' },
              { value: 'Claymore', label: 'Claymore' },
              { value: 'Polearm', label: 'Polearm' }
            ]}
            value={filters.weapon}
            onChange={(value) => setFilters({...filters, weapon: value as Weapon | ''})}
            className="p-2"
          />

          <CustomDropdown
            options={[
              { value: '', label: 'All Rarities' },
              { value: '4', label: '4★' },
              { value: '5', label: '5★' }
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
                          label: `C${num}`
                        }))}
                        value={userChar.constellation}
                        onChange={(value) => updateCharacter(character.id, { constellation: value as number })}
                        className="min-w-[80px]"
                      />
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    {!isUnowned ? (
                      <WeaponSelector
                        weaponType={character.weapon}
                        selectedWeaponName={userChar.weaponName}
                        onChange={(weaponName) => updateCharacter(character.id, { weaponName })}
                        className="min-w-[200px]"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs md:text-sm">--</span>
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    {!isUnowned && (
                      <CustomDropdown
                        options={[0, 1, 2, 3, 4, 5].map(num => ({
                          value: num,
                          label: `R${num}`
                        }))}
                        value={userChar.refinement}
                        onChange={(value) => updateCharacter(character.id, { refinement: value as number })}
                        className="min-w-[80px]"
                      />
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-white text-sm md:text-base">
                    {character.version.toFixed(1)}
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
