import React, { useState } from 'react';
import type { User } from '../types/character';
import { UserSettings } from './UserSettings';

interface UserSelectorProps {
  users: User[];
  currentUser: User | null;
  onUserSelect: (user: User) => void;
  onUserCreate: (name: string) => void;
  onUserUpdate: (updatedUser: User) => void;
  onUserDelete: (userId: string) => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  users,
  currentUser,
  onUserSelect,
  onUserCreate,
  onUserUpdate,
  onUserDelete
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  // Reset form when users change or when component mounts
  React.useEffect(() => {
    setShowCreateForm(false);
    setNewUserName('');
  }, [users]);


  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim()) {
      onUserCreate(newUserName.trim());
      setNewUserName('');
      setShowCreateForm(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewUserName('');
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        Select User
      </h2>
      {/* Debug info */}
      <div className="text-xs text-white/50 mb-2">
        Debug: {users.length} users, current: {currentUser?.name || 'none'}, showForm: {showCreateForm.toString()}, newName: "{newUserName}"
      </div>
      
      <div className="space-y-3 mb-6">
        {users.length === 0 ? (
          <div className="text-center text-white/60 py-8">
            No users found. Create your first user to get started!
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`user-card relative p-3 pr-12 rounded-xl transition-all duration-200 text-white border border-white/20 ${
                currentUser?.id === user.id ? 'selected shadow-lg' : ''
              }`}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'none',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <button
                onClick={() => onUserSelect(user)}
                className="w-full text-left pr-2 bg-transparent border-none outline-none focus:outline-none"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none'
                }}
              >
                <div className="font-medium truncate">{user.name}</div>
                <div className="text-sm opacity-80">
                  {Object.keys(user.characters).length} characters tracked
                </div>
              </button>
              <div className="absolute top-2 right-2 z-20">
                <UserSettings
                  user={user}
                  onUserUpdate={onUserUpdate}
                  onUserDelete={onUserDelete}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
        >
          + Add New User
        </button>
      ) : (
        <form onSubmit={handleCreateUser} className="space-y-3">
          <input
            type="text"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="Enter user name..."
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-500 hover:to-green-700 transition-all duration-200"
            >
              Create
            </button>
            <button
              type="button"
              onClick={handleCancelCreate}
              className="flex-1 p-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
