import React, { useState } from 'react';
import { deleteUser } from '../services/firebaseService';

interface ResetButtonProps {
  users: any[];
  onReset: () => void;
}

export const ResetButton: React.FC<ResetButtonProps> = ({ users, onReset }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReset = async () => {
    if (confirmText !== 'Delete') {
      alert('Please type "Delete" exactly to confirm the reset.');
      return;
    }

    setIsDeleting(true);
    
    try {
      // Delete all users from Firebase
      const deletePromises = users.map(user => deleteUser(user.id));
      await Promise.all(deletePromises);
      
      // Clear localStorage as backup
      localStorage.removeItem('genshin-users');
      
      // Notify parent component
      onReset();
      
      // Reset state
      setShowConfirm(false);
      setConfirmText('');
      
      alert('All data has been successfully reset!');
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Error resetting data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setConfirmText('');
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
      >
        🗑️ Reset All Data
      </button>
    );
  }

  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 space-y-3">
      <div className="text-red-400 font-medium text-sm">
        ⚠️ Danger Zone: Reset All Data
      </div>
      <div className="text-white/80 text-xs">
        This will permanently delete all users and their character progress from both Firebase and local storage.
      </div>
      <div className="space-y-2">
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder='Type "Delete" to confirm'
          className="w-full px-3 py-2 bg-white/10 border border-red-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
        />
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            disabled={isDeleting || confirmText !== 'Delete'}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            {isDeleting ? 'Deleting...' : 'Confirm Reset'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
