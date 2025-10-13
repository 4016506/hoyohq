import React, { useState, useEffect } from 'react';
import type { HSRUser, HSRUserCharacter } from '../types/hsr-character';
import { HSR_CHARACTERS } from '../data/hsr-characters';
import { HSRUserSelector } from './HSRUserSelector';
import { HSRCharacterTable } from './HSRCharacterTable';
import { ResetButton } from './ResetButton';
import { GameTabNavigation } from './GameTabNavigation';
import { saveHSRUser, getAllHSRUsers, updateHSRUserCharacter as updateHSRUserCharacterFirebase } from '../services/firebaseService';

export const HSRDashboard: React.FC = () => {
  const [users, setUsers] = useState<HSRUser[]>([]);
  const [currentUser, setCurrentUser] = useState<HSRUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load users from Firebase on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        console.log('Attempting to load HSR users from Firebase...');
        const firebaseUsers = await getAllHSRUsers();
        console.log('Firebase HSR users loaded:', firebaseUsers);
        setUsers(firebaseUsers);
        // Set the first user as current if none is selected
        if (firebaseUsers.length > 0 && !currentUser) {
          setCurrentUser(firebaseUsers[0]);
        }
      } catch (error) {
        console.error('Error loading HSR users from Firebase:', error);
        // Fallback to localStorage if Firebase fails
        const savedUsers = localStorage.getItem('hsr-users');
        console.log('Checking localStorage for HSR users:', savedUsers);
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers);
          console.log('Parsed localStorage HSR users:', parsedUsers);
          setUsers(parsedUsers);
          if (parsedUsers.length > 0 && !currentUser) {
            setCurrentUser(parsedUsers[0]);
          }
        }
      }
      setIsLoading(false);
    };

    loadUsers();
  }, []);

  // Save users to localStorage whenever they change (backup)
  useEffect(() => {
    if (!isLoading && users.length > 0) {
      localStorage.setItem('hsr-users', JSON.stringify(users));
    }
  }, [users, isLoading]);

  const createUser = async (name: string) => {
    const newUser: HSRUser = {
      id: Date.now().toString(),
      name,
      characters: {}
    };
    
    try {
      await saveHSRUser(newUser);
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
    } catch (error) {
      console.error('Error saving HSR user to Firebase:', error);
      // Fallback to local state if Firebase fails
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
    }
  };

  const updateUserCharacter = async (characterId: string, updates: Partial<HSRUserCharacter>) => {
    if (!currentUser) return;

    const existingCharacter = currentUser.characters[characterId];
    const updatedCharacterData: HSRUserCharacter = {
      characterId,
      status: existingCharacter?.status || 'Unowned',
      eidolon: existingCharacter?.eidolon || 0,
      superposition: existingCharacter?.superposition || 0,
      lightConeName: existingCharacter?.lightConeName || 'N/A',
      ...updates
    };

    const updatedUser: HSRUser = {
      ...currentUser,
      characters: {
        ...currentUser.characters,
        [characterId]: updatedCharacterData
      }
    };

    try {
      await updateHSRUserCharacterFirebase(currentUser.id, characterId, updatedCharacterData);
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id ? updatedUser : user
      ));
    } catch (error) {
      console.error('Error updating HSR character in Firebase:', error);
      // Fallback to local state if Firebase fails
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id ? updatedUser : user
      ));
    }
  };

  const handleUserUpdate = async (userId: string, newName: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, name: newName } : user
    );
    
    const updatedUser = updatedUsers.find(u => u.id === userId);
    if (updatedUser) {
      try {
        await saveHSRUser(updatedUser);
        setUsers(updatedUsers);
        if (currentUser?.id === userId) {
          setCurrentUser({ ...currentUser, name: newName });
        }
      } catch (error) {
        console.error('Error updating HSR user in Firebase:', error);
        // Fallback to local state if Firebase fails
        setUsers(updatedUsers);
        if (currentUser?.id === userId) {
          setCurrentUser({ ...currentUser, name: newName });
        }
      }
    }
  };

  const handleUserDelete = async (userId: string) => {
    try {
      const { deleteHSRUser } = await import('../services/firebaseService');
      await deleteHSRUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      if (currentUser?.id === userId) {
        const remainingUsers = users.filter(user => user.id !== userId);
        setCurrentUser(remainingUsers.length > 0 ? remainingUsers[0] : null);
      }
    } catch (error) {
      console.error('Error deleting HSR user from Firebase:', error);
      // Fallback to local state if Firebase fails
      setUsers(prev => prev.filter(user => user.id !== userId));
      if (currentUser?.id === userId) {
        const remainingUsers = users.filter(user => user.id !== userId);
        setCurrentUser(remainingUsers.length > 0 ? remainingUsers[0] : null);
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset ALL HSR user data? This action cannot be undone.')) {
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

        {/* Stats Summary - Per User */}
        {currentUser && (
          <div className="mb-6 md:mb-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 text-center">
              <div className="text-xl md:text-3xl font-bold text-white">
                {Object.values(currentUser.characters).filter(c => c.status === 'Built' || c.status === 'WIP').length}
              </div>
              <div className="text-white/60 text-sm md:text-base">Characters Tracked</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 text-center">
              <div className="text-xl md:text-3xl font-bold text-green-400">
                {Object.values(currentUser.characters).filter(c => c.status === 'Built').length}
              </div>
              <div className="text-white/60 text-sm md:text-base">Built Characters</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 text-center">
              <div className="text-xl md:text-3xl font-bold text-yellow-400">
                {Object.values(currentUser.characters).filter(c => c.status === 'WIP').length}
              </div>
              <div className="text-white/60 text-sm md:text-base">Work in Progress</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 text-center">
              <div className="text-xl md:text-3xl font-bold text-gray-400">
                {HSR_CHARACTERS.length - Object.values(currentUser.characters).filter(c => c.status === 'Built' || c.status === 'WIP').length}
              </div>
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

