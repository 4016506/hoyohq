import React, { useState, useEffect } from 'react';
import type { User, UserCharacter } from '../types/character';
import { CHARACTERS } from '../data/characters';
import { UserSelector } from './UserSelector';
import { CharacterTable } from './CharacterTable';
import { ResetButton } from './ResetButton';
import { saveUser, getAllUsers, updateUserCharacter as updateUserCharacterFirebase } from '../services/firebaseService';

export const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load users from Firebase on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        console.log('Attempting to load users from Firebase...');
        const firebaseUsers = await getAllUsers();
        console.log('Firebase users loaded:', firebaseUsers);
        setUsers(firebaseUsers);
        // Set the first user as current if none is selected
        if (firebaseUsers.length > 0 && !currentUser) {
          setCurrentUser(firebaseUsers[0]);
        }
      } catch (error) {
        console.error('Error loading users from Firebase:', error);
        // Fallback to localStorage if Firebase fails
        const savedUsers = localStorage.getItem('genshin-users');
        console.log('Checking localStorage for users:', savedUsers);
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers);
          console.log('Parsed localStorage users:', parsedUsers);
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

  const createUser = async (name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      characters: {}
    };
    
    try {
      await saveUser(newUser);
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
    } catch (error) {
      console.error('Error saving user to Firebase:', error);
      // Fallback to local state if Firebase fails
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
    }
  };

  const updateUserCharacter = async (characterId: string, updates: Partial<UserCharacter>) => {
    if (!currentUser) return;

    const existingCharacter = currentUser.characters[characterId];
    const updatedCharacterData: UserCharacter = {
      characterId,
      status: existingCharacter?.status || 'Unowned',
      constellation: existingCharacter?.constellation || 0,
      refinement: existingCharacter?.refinement || 0,
      weaponName: existingCharacter?.weaponName || 'N/A',
      ...updates
    };

    const updatedUser: User = {
      ...currentUser,
      characters: {
        ...currentUser.characters,
        [characterId]: updatedCharacterData
      }
    };

    try {
      await updateUserCharacterFirebase(currentUser.id, characterId, updatedCharacterData);
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id ? updatedUser : user
      ));
    } catch (error) {
      console.error('Error updating character in Firebase:', error);
      // Fallback to local state if Firebase fails
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id ? updatedUser : user
      ));
    }
  };

  const handleReset = () => {
    setUsers([]);
    setCurrentUser(null);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleUserDelete = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    if (currentUser?.id === userId) {
      const remainingUsers = users.filter(user => user.id !== userId);
      setCurrentUser(remainingUsers.length > 0 ? remainingUsers[0] : null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  // Debug info
  console.log('Dashboard render - users:', users, 'currentUser:', currentUser);
  
  // Create a test user if none exist
  const createTestUser = () => {
    const testUser: User = {
      id: 'test-user-1',
      name: 'Test User',
      characters: {}
    };
    setUsers([testUser]);
    setCurrentUser(testUser);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-2 md:mb-4 bg-gradient-to-r from-yellow-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Genshin Impact
          </h1>
          <p className="text-lg md:text-xl text-white/80">
            Character Progress Tracker
          </p>
          {/* Test button */}
          {users.length === 0 && (
            <button
              onClick={createTestUser}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            >
              Create Test User
            </button>
          )}
        </div>

        {/* Stats Summary */}
        {currentUser && (
          <div className="mb-6 md:mb-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 text-center">
              <div className="text-xl md:text-3xl font-bold text-white">
                {Object.keys(currentUser.characters).length}
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
                {CHARACTERS.length - Object.keys(currentUser.characters).length}
              </div>
              <div className="text-white/60 text-sm md:text-base">Not Owned</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* User Selector */}
          <div className="lg:col-span-1">
            <UserSelector
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
              <CharacterTable
                characters={CHARACTERS}
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
