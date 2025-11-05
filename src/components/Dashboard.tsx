import React, { useState, useEffect } from 'react';
import type { User, UserCharacter } from '../types/character';
import { CHARACTERS } from '../data/characters';
import { CompactUserSelector } from './CompactUserSelector';
import { CharacterTable } from './CharacterTable';
import { ResetButton } from './ResetButton';
import { GameTabNavigation } from './GameTabNavigation';
import { saveUser, getAllUsers, updateUserCharacter as updateUserCharacterFirebase } from '../services/firebaseService';

export const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Load users from Firebase on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        console.log('Attempting to load users from Firebase...');
        const firebaseUsers = await getAllUsers();
        console.log('Firebase users loaded:', firebaseUsers);
        
        if (firebaseUsers.length > 0) {
          setUsers(firebaseUsers);
          // Set the first user as current if none is selected
          if (!currentUser) {
            setCurrentUser(firebaseUsers[0]);
          }
        } else {
          // If Firebase returns empty, check localStorage as fallback
          console.log('Firebase returned empty array, checking localStorage...');
          const savedUsers = localStorage.getItem('genshin-users');
          if (savedUsers) {
            try {
              const parsedUsers = JSON.parse(savedUsers);
              console.log('Parsed localStorage users:', parsedUsers);
              if (parsedUsers.length > 0) {
                setUsers(parsedUsers);
                if (!currentUser) {
                  setCurrentUser(parsedUsers[0]);
                }
              }
            } catch (parseError) {
              console.error('Error parsing localStorage users:', parseError);
            }
          }
        }
      } catch (error: any) {
        console.error('Error loading users from Firebase:', error);
        
        // Check if it's a permissions error
        const isPermissionError = error?.code === 'permission-denied' || 
                                  error?.message?.includes('permission') ||
                                  error?.message?.includes('Missing or insufficient permissions');
        
        if (isPermissionError) {
          console.warn('Firebase permissions error detected. Falling back to localStorage and checking for Firebase rules issue.');
        }
        
        // Fallback to localStorage if Firebase fails
        const savedUsers = localStorage.getItem('genshin-users');
        console.log('Checking localStorage for users:', savedUsers);
        if (savedUsers) {
          try {
            const parsedUsers = JSON.parse(savedUsers);
            console.log('Parsed localStorage users:', parsedUsers);
            if (parsedUsers.length > 0) {
              setUsers(parsedUsers);
              if (!currentUser) {
                setCurrentUser(parsedUsers[0]);
              }
              console.log('Successfully loaded users from localStorage fallback');
            }
          } catch (parseError) {
            console.error('Error parsing localStorage users:', parseError);
          }
        } else if (isPermissionError) {
          console.warn('No localStorage backup found. Users need to fix Firebase security rules.');
          setFirebaseError('Firebase permissions error. Please update your Firestore security rules to allow read/write access.');
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
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setCurrentUser(newUser);
      // Save to localStorage as backup
      localStorage.setItem('genshin-users', JSON.stringify(updatedUsers));
    } catch (error: any) {
      console.error('Error saving user to Firebase:', error);
      // Fallback to local state if Firebase fails
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setCurrentUser(newUser);
      // Save to localStorage as backup
      localStorage.setItem('genshin-users', JSON.stringify(updatedUsers));
      
      // If it's a permissions error, show the error banner
      const isPermissionError = error?.code === 'permission-denied' || 
                                error?.message?.includes('permission') ||
                                error?.message?.includes('Missing or insufficient permissions');
      if (isPermissionError && !firebaseError) {
        setFirebaseError('Firebase permissions error. Please update your Firestore security rules to allow read/write access.');
      }
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
      const updatedUsers = users.map(user => 
        user.id === currentUser.id ? updatedUser : user
      );
      setUsers(updatedUsers);
      // Save to localStorage as backup
      localStorage.setItem('genshin-users', JSON.stringify(updatedUsers));
    } catch (error: any) {
      console.error('Error updating character in Firebase:', error);
      // Fallback to local state if Firebase fails
      const updatedUsers = users.map(user => 
        user.id === currentUser.id ? updatedUser : user
      );
      setCurrentUser(updatedUser);
      setUsers(updatedUsers);
      // Save to localStorage as backup
      localStorage.setItem('genshin-users', JSON.stringify(updatedUsers));
      
      // If it's a permissions error, show the error banner
      const isPermissionError = error?.code === 'permission-denied' || 
                                error?.message?.includes('permission') ||
                                error?.message?.includes('Missing or insufficient permissions');
      if (isPermissionError && !firebaseError) {
        setFirebaseError('Firebase permissions error. Please update your Firestore security rules to allow read/write access.');
      }
    }
  };

  const handleReset = () => {
    setUsers([]);
    setCurrentUser(null);
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
    setUsers(prev => prev.filter(user => user.id !== userId));
    if (currentUser?.id === userId) {
      const remainingUsers = users.filter(user => user.id !== userId);
      setCurrentUser(remainingUsers.length > 0 ? remainingUsers[0] : null);
    }
  };

  const handleReloadFromFirebase = async () => {
    setIsLoading(true);
    setFirebaseError(null);
    try {
      console.log('Manual reload: Attempting to load users from Firebase...');
      const firebaseUsers = await getAllUsers();
      console.log('Manual reload: Firebase users loaded:', firebaseUsers);
      
      if (firebaseUsers.length > 0) {
        setUsers(firebaseUsers);
        setCurrentUser(firebaseUsers[0]);
        setFirebaseError(null); // Clear error on success
        alert(`Successfully loaded ${firebaseUsers.length} user(s) from Firebase!`);
      } else {
        alert('No users found in Firebase. Please check your Firebase console to verify the data exists in the "users" collection.');
      }
    } catch (error: any) {
      console.error('Manual reload: Error loading users from Firebase:', error);
      const isPermissionError = error?.code === 'permission-denied' || 
                                error?.message?.includes('permission') ||
                                error?.message?.includes('Missing or insufficient permissions');
      
      if (isPermissionError) {
        setFirebaseError('Firebase permissions error. Please update your Firestore security rules.');
      } else {
        alert('Error loading users from Firebase. Check the console for details.');
      }
    } finally {
      setIsLoading(false);
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
        {/* Game Tab Navigation */}
        <GameTabNavigation />
        
        {/* Blog Button - Fixed Position */}
        <button
          onClick={() => window.location.href = '/blog'}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center gap-2"
        >
          <span>🍳</span>
          <span className="hidden sm:inline">The Kitchen</span>
        </button>
        
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-2 md:mb-4 bg-gradient-to-r from-yellow-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            HOYO HQ
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-4">
            Three friends, two games, one dream.
          </p>
          
          {/* Compact User Selector */}
          <div className="flex justify-center relative">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 md:p-4 w-full max-w-4xl relative z-20">
              <CompactUserSelector
                users={users}
                currentUser={currentUser}
                onUserSelect={setCurrentUser}
                onUserCreate={createUser}
                onUserUpdate={handleUserUpdate}
                onUserDelete={handleUserDelete}
              />
            </div>
          </div>
          
          {/* Firebase Error Banner */}
          {firebaseError && (
            <div className="mt-4 mx-auto max-w-4xl bg-red-500/20 border border-red-500/50 rounded-xl p-4 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="text-red-400 text-xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-red-300 font-bold mb-2">Firebase Permissions Error</h3>
                  <p className="text-red-200 text-sm mb-3">{firebaseError}</p>
                  <div className="bg-black/20 rounded-lg p-3 mb-3">
                    <p className="text-white/90 text-xs font-semibold mb-2">To fix this, update your Firestore security rules:</p>
                    <ol className="text-white/80 text-xs list-decimal list-inside space-y-1 ml-2">
                      <li>Go to <a href="https://console.firebase.google.com/project/hoyohq-f2dc9/firestore/rules" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">Firebase Console → Firestore → Rules</a></li>
                      <li>Update the rules to allow read/write access:</li>
                    </ol>
                    <pre className="mt-2 text-xs bg-black/40 p-2 rounded overflow-x-auto text-green-300">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }
    match /hsr-users/{userId} {
      allow read, write: if true;
    }
    match /blog-posts/{postId} {
      allow read, write: if true;
    }
    match /blog-replies/{replyId} {
      allow read, write: if true;
    }
  }
}`}
                    </pre>
                    <p className="text-white/70 text-xs mt-2">⚠️ Note: These rules allow public access. For production, implement proper authentication.</p>
                  </div>
                  <button
                    onClick={() => setFirebaseError(null)}
                    className="text-red-300 hover:text-red-200 text-xs underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reload and Test buttons */}
          {users.length === 0 && (
            <div className="mt-4 flex gap-3 justify-center items-center">
              <button
                onClick={handleReloadFromFirebase}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg"
              >
                🔄 Reload from Firebase
              </button>
              <button
                onClick={createTestUser}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Create Test User
              </button>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {currentUser && (
          <div className="mb-6 md:mb-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative z-0">
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
                {CHARACTERS.length - Object.values(currentUser.characters).filter(c => c.status === 'Built' || c.status === 'WIP').length}
              </div>
              <div className="text-white/60 text-sm md:text-base">Not Owned</div>
            </div>
          </div>
        )}

        {/* Character Table - Full Width */}
        <div className="w-full">
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
