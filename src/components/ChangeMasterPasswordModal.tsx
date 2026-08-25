import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, LockIcon } from './icons';

interface ChangeMasterPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (oldPassword: string, newPassword: string) => Promise<{success: boolean; message?: string}>;
}

const ChangeMasterPasswordModal: React.FC<ChangeMasterPasswordModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isOldVisible, setIsOldVisible] = useState(false);
  const [isNewVisible, setIsNewVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    const result = await onSubmit(oldPassword, newPassword);
    setIsLoading(false);
    
    if (result.success) {
      handleClose();
    } else {
      setError(result.message || 'An unexpected error occurred.');
    }
  };

  const handleClose = () => {
    // Reset state on close
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsLoading(false);
    setIsOldVisible(false);
    setIsNewVisible(false);
    setIsConfirmVisible(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-2xl shadow-lg m-4"
        onClick={e => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="text-center">
          <LockIcon className="w-12 h-12 mx-auto text-cyan-400" />
          <h2 className="mt-4 text-2xl font-bold text-white">Change Master Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={isOldVisible ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Current Master Password"
              className="w-full pl-4 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
              required
              autoFocus
            />
            <button type="button" onClick={() => setIsOldVisible(!isOldVisible)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white" aria-label="Toggle current password visibility">
              {isOldVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="relative">
            <input
              type={isNewVisible ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Master Password"
              className="w-full pl-4 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
              required
            />
            <button type="button" onClick={() => setIsNewVisible(!isNewVisible)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white" aria-label="Toggle new password visibility">
              {isNewVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="relative">
            <input
              type={isConfirmVisible ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Master Password"
              className="w-full pl-4 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
              required
            />
            <button type="button" onClick={() => setIsConfirmVisible(!isConfirmVisible)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white" aria-label="Toggle confirm new password visibility">
              {isConfirmVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <div className="flex justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeMasterPasswordModal;