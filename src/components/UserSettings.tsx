import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { User } from '../types/character';
import { deleteUser, saveUser } from '../services/firebaseService';

interface UserSettingsProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  onUserDelete: (userId: string) => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({
  user,
  onUserUpdate,
  onUserDelete
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [isDeleting, setIsDeleting] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });

  // Remove problematic click outside detection that causes modal to move

  const handleSaveName = async () => {
    if (newName.trim() === user.name.trim()) {
      setIsEditing(false);
      return;
    }

    if (!newName.trim()) {
      alert('Username cannot be empty!');
      return;
    }

    try {
      const updatedUser: User = {
        ...user,
        name: newName.trim()
      };
      
      await saveUser(updatedUser);
      onUserUpdate(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Error updating username. Please try again.');
      setNewName(user.name);
    }
  };

  const handleCancelEdit = () => {
    setNewName(user.name);
    setIsEditing(false);
  };

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${user.name}"?\n\nThis will permanently remove all their character progress.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    
    try {
      await deleteUser(user.id);
      // Clear from localStorage as backup
      const savedUsers = localStorage.getItem('genshin-users');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        const filteredUsers = parsedUsers.filter((u: User) => u.id !== user.id);
        localStorage.setItem('genshin-users', JSON.stringify(filteredUsers));
      }
      
      onUserDelete(user.id);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const modalHeight = 200; // Approximate modal height
          const spaceBelow = window.innerHeight - rect.bottom;
          
          // Position below if there's enough space, otherwise above
          const top = spaceBelow >= modalHeight 
            ? rect.bottom + 8 
            : rect.top - modalHeight - 8;
            
          setButtonPosition({
            top: Math.max(8, Math.min(top, window.innerHeight - modalHeight - 8)),
            right: Math.max(8, window.innerWidth - rect.right)
          });
          setShowSettings(!showSettings);
        }}
        className="p-2 rounded-lg"
        title="User Settings"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {showSettings && createPortal(
        <div 
          className="user-settings-modal fixed w-64 bg-white/15 rounded-xl border border-white/20 shadow-xl" 
          style={{ 
            zIndex: 9999,
            top: `${buttonPosition.top}px`,
            right: `${buttonPosition.right}px`
          }}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium text-sm">User Settings</h3>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Close button clicked for user:', user.name);
                      setShowSettings(false);
                    }}
                    className="p-2 rounded-lg close-button"
                    style={{ pointerEvents: 'auto', zIndex: 10001 }}
                  >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Username Edit */}
            <div className="space-y-2">
              <label className="text-white/80 text-xs font-medium">Username</label>
              {!isEditing ? (
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">{user.name}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Edit button clicked for user:', user.name);
                      setIsEditing(true);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium edit-button"
                    style={{ pointerEvents: 'auto', zIndex: 10001 }}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Save button clicked for user:', user.name);
                        handleSaveName();
                      }}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium save-button"
                      style={{ pointerEvents: 'auto', zIndex: 10001 }}
                    >
                      Save
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Cancel button clicked for user:', user.name);
                        handleCancelEdit();
                      }}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium cancel-button"
                      style={{ pointerEvents: 'auto', zIndex: 10001 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Delete User */}
            <div className="pt-2 border-t border-white/20">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Delete button clicked for user:', user.name);
                  handleDeleteUser();
                }}
                disabled={isDeleting}
                className="w-full px-4 py-3 rounded-lg text-sm font-medium delete-button"
                style={{ pointerEvents: 'auto', zIndex: 10001 }}
              >
                {isDeleting ? 'Deleting...' : '🗑️ Delete User'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
