import React, { useState } from 'react';
import { LockIcon, EyeIcon, EyeOffIcon } from './icons';

interface LoginScreenProps {
  hasMasterPassword_doNotUse: boolean; // Renamed to avoid confusion, should use isSetup
  isSetup: boolean;
  onLogin: (password: string) => Promise<boolean>;
  onSetup: (password: string) => Promise<void>;
  onResetVault?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ isSetup, onLogin, onSetup, onResetVault }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // This state will track if the user has clicked "Create Vault" on the initial setup screen.
  const [isCreatingVault, setIsCreatingVault] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      if (isSetup) {
        const success = await onLogin(password);
        if (!success) {
          setError('Incorrect master password.');
        }
      } else {
        if (password.length < 8) {
          setError('Password must be at least 8 characters long.');
          setIsProcessing(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsProcessing(false);
          return;
        }
        await onSetup(password);
      }
    } catch (err) {
      setError('An error occurred during authentication.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReset = () => {
    if (onResetVault) {
      onResetVault();
      setShowResetConfirm(false);
      setPassword('');
      setConfirmPassword('');
      setError('');
    }
  };

  const renderSetupInitial = () => (
    <div className="text-center">
      <button
        onClick={() => setIsCreatingVault(true)}
        className="w-full px-4 py-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors"
      >
        Create New Vault
      </button>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <input
          type={isPasswordVisible ? 'text' : 'password'}
          id="master-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Master Password"
          className="w-full pl-4 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-all"
          autoFocus
          disabled={isProcessing}
        />
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
          aria-label="Toggle password visibility"
          disabled={isProcessing}
        >
          {isPasswordVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>

      {!isSetup && (
        <div className="relative">
          <input
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Master Password"
            className="w-full pl-4 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-all"
            disabled={isProcessing}
          />
          <button
            type="button"
            onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
            aria-label="Toggle confirm password visibility"
            disabled={isProcessing}
          >
            {isConfirmPasswordVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full px-4 py-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : (isSetup ? 'Unlock' : 'Create Vault')}
      </button>

      {isSetup && onResetVault && (
        <div className="pt-4 mt-4 border-t border-slate-700 text-center">
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-sm text-slate-400 hover:text-red-400 transition-colors underline"
              disabled={isProcessing}
            >
              Forgot master password? Reset vault
            </button>
          ) : (
            <div className="p-4 bg-red-900/30 border border-red-800/50 rounded-lg text-left">
              <p className="text-red-300 text-sm mb-3">
                <strong>Warning:</strong> Without the master password, encrypted data cannot be recovered. Resetting will permanently wipe all credentials and reset your vault.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-700 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded transition-colors"
                >
                  Yes, Delete Vault
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );

  let subtitle: string;
  let content: React.ReactNode;

  if (isSetup) {
    subtitle = 'Unlock your vault';
    content = renderForm();
  } else {
    // This is the setup phase
    if (isCreatingVault) {
      subtitle = 'Set your master password';
      content = renderForm();
    } else {
      subtitle = 'Securely store and manage your passwords.';
      content = renderSetupInitial();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="w-full max-w-sm p-8 space-y-8 bg-slate-800 rounded-2xl shadow-lg">
        <div className="text-center">
            <LockIcon className="w-16 h-16 mx-auto text-cyan-400" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Password Vault</h1>
            <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        </div>
        {content}
      </div>
    </div>
  );
};

export default LoginScreen;