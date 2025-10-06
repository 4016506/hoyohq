import React, { useState, useEffect } from 'react';
import type { HSRUser, HSRUserCharacter } from '../types/hsr-character';
import { HSR_CHARACTERS } from '../data/hsr-characters';
import { HSRUserSelector } from './HSRUserSelector';
import { HSRCharacterTable } from './HSRCharacterTable';
import { ResetButton } from './ResetButton';
import { GameTabNavigation } from './GameTabNavigation';

export const HSRDashboard: React.FC = () => {
  const [users, setUsers] = useState<HSRUser[]>([]);
  const [currentUser, setCurrentUser] = useState<HSRUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load users from localStorage on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const savedUsers = localStorage.getItem('hsr-users');
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers);
          setUsers(parsedUsers);
          if (parsedUsers.length > 0 && !currentUser) {
            setCurrentUser(parsedUsers[0]);
          }
        }
      } catch (error) {
        console.error('Error loading users from localStorage:', error);
      }
      setIsLoading(false);
    };

    loadUsers();
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('hsr-users', JSON.stringify(users));
    }
  }, [users, isLoading]);

  const createUser = (name: string) => {
    const newUser: HSRUser = {
      id: `user-${Date.now()}`,
      name,
      characters: {}
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const updateUserCharacter = (characterId: string, updates: Partial<HSRUserCharacter>) => {
    if (!currentUser) return;

    const updatedCharacters = {
      ...currentUser.characters,
      [characterId]: {
        ...(currentUser.characters[characterId] || {
          characterId,
          status: 'Unowned',
          eidolon: 0,
          superposition: 0,
          lightConeName: 'N/A'
        }),
        ...updates
      }
    };

    const updatedUser = {
      ...currentUser,
      characters: updatedCharacters
    };

    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleUserUpdate = (userId: string, newName: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, name: newName } : user
    );
    setUsers(updatedUsers);
    
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, name: newName });
    }
  };

  const handleUserDelete = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUsers.length > 0 ? updatedUsers[0] : null);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset ALL user data? This action cannot be undone.')) {
      localStorage.removeItem('hsr-users');
      setUsers([]);
      setCurrentUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Calculate stats for all users
  const totalOwned = users.reduce((acc, user) => {
    return acc + Object.values(user.characters).filter(c => c.status !== 'Unowned').length;
  }, 0);

  const totalBuilt = users.reduce((acc, user) => {
    return acc + Object.values(user.characters).filter(c => c.status === 'Built').length;
  }, 0);

  const totalWIP = users.reduce((acc, user) => {
    return acc + Object.values(user.characters).filter(c => c.status === 'WIP').length;
  }, 0);

  const totalUnowned = (HSR_CHARACTERS.length * users.length) - (totalOwned + totalBuilt + totalWIP);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Game Tab Navigation */}
        <GameTabNavigation />
        
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-2 md:mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            HOYO HQ
          </h1>
          <p className="text-lg md:text-xl text-white/80">
            Three friends, two games, one dream.
          </p>
        </div>

        {/* Overall Stats */}
        {users.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">{totalBuilt}</div>
              <div className="text-white/60 text-sm md:text-base">Built</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">{totalWIP}</div>
              <div className="text-white/60 text-sm md:text-base">WIP</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">{totalOwned}</div>
              <div className="text-white/60 text-sm md:text-base">Owned</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-400 mb-1">{totalUnowned}</div>
              <div className="text-white/60 text-sm md:text-base">Not Owned</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* User Selector */}
          <div className="lg:col-span-1">
            <HSRUserSelector
              users={users}
              currentUser={currentUser}
              onUserSelect={setCurrentUser}
              onUserCreate={createUser}
              onUserUpdate={handleUserUpdate}
              onUserDelete={handleUserDelete}
            />
          </div>

          {/* Character Table */}
          <div className="lg:col-span-3">
            {currentUser ? (
              <HSRCharacterTable
                characters={HSR_CHARACTERS}
                currentUser={currentUser}
                onUpdateUserCharacter={updateUserCharacter}
              />
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 shadow-xl text-center">
                <div className="text-white/60 text-lg">
                  Select or create a user to start tracking your characters!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reset Button - Bottom */}
        {users.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex justify-center">
              <ResetButton users={users} onReset={handleReset} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

