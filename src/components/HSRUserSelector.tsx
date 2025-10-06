import React, { useState } from 'react';
import type { HSRUser } from '../types/hsr-character';
import { CustomDropdown } from './CustomDropdown';

interface HSRUserSelectorProps {
  users: HSRUser[];
  currentUser: HSRUser | null;
  onUserSelect: (user: HSRUser) => void;
  onUserCreate: (name: string) => void;
  onUserUpdate: (userId: string, newName: string) => void;
  onUserDelete: (userId: string) => void;
}

export const HSRUserSelector: React.FC<HSRUserSelectorProps> = ({
  users,
  currentUser,
  onUserSelect,
  onUserCreate,
  onUserUpdate,
  onUserDelete
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [editUserName, setEditUserName] = useState('');

  const handleCreateUser = () => {
    if (newUserName.trim()) {
      onUserCreate(newUserName.trim());
      setNewUserName('');
      setIsCreating(false);
    }
  };

  const handleUpdateUser = () => {
    if (currentUser && editUserName.trim()) {
      onUserUpdate(currentUser.id, editUserName.trim());
      setEditUserName('');
      setIsEditing(false);
    }
  };

  const handleDeleteUser = () => {
    if (currentUser && window.confirm(`Are you sure you want to delete ${currentUser.name}?`)) {
      onUserDelete(currentUser.id);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditUserName('');
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Users</h2>
      
      {/* User Selection Dropdown */}
      {users.length > 0 && (
        <div className="mb-4">
          <CustomDropdown
            options={users.map(user => ({
              value: user.id,
              label: user.name
            }))}
            value={currentUser?.id || ''}
            onChange={(value) => {
              const user = users.find(u => u.id === value);
              if (user) onUserSelect(user);
            }}
            placeholder="Select a user"
            className="w-full"
          />
        </div>
      )}

      {/* Create New User Section */}
      {!isCreating && !isEditing && (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full mb-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium text-sm md:text-base"
        >
          + Create New User
        </button>
      )}

      {isCreating && (
        <div className="mb-4 space-y-2">
          <input
            type="text"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateUser()}
            placeholder="Enter user name"
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-genshin-blue text-sm md:text-base"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateUser}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewUserName('');
              }}
              className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* User Management Section */}
      {currentUser && !isCreating && (
        <div className="space-y-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditUserName(currentUser.name);
                }}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm md:text-base"
              >
                Edit User Name
              </button>
              {users.length > 1 && (
                <button
                  onClick={handleDeleteUser}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm md:text-base"
                >
                  Delete User
                </button>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateUser()}
                placeholder="Enter new name"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-genshin-blue text-sm md:text-base"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Stats */}
      {currentUser && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3">Statistics</h3>
          <div className="space-y-2 text-sm md:text-base">
            <div className="flex justify-between text-white/80">
              <span>Total Characters:</span>
              <span className="font-medium">{Object.keys(currentUser.characters).length}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Built:</span>
              <span className="font-medium text-green-400">
                {Object.values(currentUser.characters).filter(c => c.status === 'Built').length}
              </span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>WIP:</span>
              <span className="font-medium text-yellow-400">
                {Object.values(currentUser.characters).filter(c => c.status === 'WIP').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

