import React, { useState } from 'react';
import type { HSRUser } from '../types/hsr-character';
import { CustomDropdown } from './CustomDropdown';

interface CompactHSRUserSelectorProps {
  users: HSRUser[];
  currentUser: HSRUser | null;
  onUserSelect: (user: HSRUser) => void;
  onUserCreate: (name: string) => void;
  onUserUpdate: (userId: string, newName: string) => void;
  onUserDelete: (userId: string) => void;
}

export const CompactHSRUserSelector: React.FC<CompactHSRUserSelectorProps> = ({
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

  return (
    <div className="relative flex flex-col sm:flex-row items-center gap-4 w-fit mx-auto z-10">
      {/* User Selection Section */}
      <div className="flex items-center gap-3">
        <span className="text-white/90 text-base font-semibold">Current User</span>
        {users.length > 0 && (
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
            className="min-w-[140px]"
          />
        )}
      </div>

      {/* User Management Actions */}
      <div className="flex items-center gap-3">
        {!isCreating && !isEditing && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-emerald-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New User
          </button>
        )}

        {isCreating && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateUser()}
              placeholder="Enter user name"
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-40"
              autoFocus
            />
            <button
              onClick={handleCreateUser}
              className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-emerald-500/25"
              title="Create user"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewUserName('');
              }}
              className="p-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
              title="Cancel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {currentUser && !isCreating && (
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditUserName(currentUser.name);
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg hover:shadow-blue-500/25"
                  title="Edit user name"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Edit</span>
                </button>
                {users.length > 1 && (
                  <button
                    onClick={handleDeleteUser}
                    className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg hover:shadow-red-500/25"
                    title="Delete user"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateUser()}
                  placeholder="New name"
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
                  autoFocus
                />
                <button
                  onClick={handleUpdateUser}
                  className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-emerald-500/25"
                  title="Save changes"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditUserName('');
                  }}
                  className="p-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                  title="Cancel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
