import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

// Watermark component for credit
// const Watermark: React.FC = () => {
//   return (
//     <div className="fixed bottom-3 right-4 z-[9999] text-xs font-medium text-slate-400 select-none pointer-events-none">
//       © CSE-2100 | Gulshan Kumer Ongshu (1903176)
//     </div>
//   );
// };

// Generate a random string for salt
const generateSalt = () => {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

function App() {
  const [hasVault, setHasVault] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPasswordKey, setMasterPasswordKey] = useState<string | null>(null);

  // Check if vault is set up
  useEffect(() => {
    const salt = window.localStorage.getItem('vault-salt');
    const authCheck = window.localStorage.getItem('vault-auth-check');
    if (salt && authCheck) {
      setHasVault(true);
    }
  }, []);

  const handleLogin = useCallback(async (password: string): Promise<boolean> => {
    const salt = window.localStorage.getItem('vault-salt');
    const authCheckString = window.localStorage.getItem('vault-auth-check');
    
    if (!salt || !authCheckString) return false;

    try {
      const authCheck = JSON.parse(authCheckString);
      const keyHex = await window.electronCrypto.deriveKey(password, salt);
      const decrypted = await window.electronCrypto.decrypt(keyHex, authCheck);

      if (decrypted === 'AUTH_OK') {
        setMasterPasswordKey(keyHex);
        setIsAuthenticated(true);
        return true;
      }
    } catch (e) {
      console.error('Login failed:', e);
    }
    return false;
  }, []);

  const handleSetup = useCallback(async (password: string) => {
    try {
      const salt = generateSalt();
      const keyHex = await window.electronCrypto.deriveKey(password, salt);
      
      const authCheck = await window.electronCrypto.encrypt(keyHex, 'AUTH_OK');
      
      window.localStorage.setItem('vault-salt', salt);
      window.localStorage.setItem('vault-auth-check', JSON.stringify(authCheck));
      
      setHasVault(true);
      setMasterPasswordKey(keyHex);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Setup failed:', e);
    }
  }, []);

  const handleLock = () => {
    setIsAuthenticated(false);
    setMasterPasswordKey(null);
  };

  const handleResetVault = useCallback(() => {
    window.localStorage.removeItem('vault-salt');
    window.localStorage.removeItem('vault-auth-check');
    window.localStorage.removeItem('password-data');
    setHasVault(false);
    setIsAuthenticated(false);
    setMasterPasswordKey(null);
  }, []);

  const handleDeleteVault = useCallback(() => {
    if (window.confirm('Are you sure you want to delete the entire vault? All your saved passwords will be permanently erased. This action cannot be undone.')) {
        handleResetVault();
    }
  }, [handleResetVault]);

  const handleChangeMasterPassword = useCallback(async (oldPassword: string, newPassword: string): Promise<{success: boolean; message?: string}> => {
    try {
      const salt = window.localStorage.getItem('vault-salt');
      const authCheckString = window.localStorage.getItem('vault-auth-check');
      
      if (!salt || !authCheckString || !masterPasswordKey) {
        return { success: false, message: 'Vault is missing or locked.' };
      }

      // 1. Verify old password
      const oldKeyHex = await window.electronCrypto.deriveKey(oldPassword, salt);
      if (oldKeyHex !== masterPasswordKey) {
         return { success: false, message: 'Incorrect current master password.' };
      }

      // 2. Generate new key and new auth check
      const newSalt = generateSalt();
      const newKeyHex = await window.electronCrypto.deriveKey(newPassword, newSalt);
      const newAuthCheck = await window.electronCrypto.encrypt(newKeyHex, 'AUTH_OK');

      // 3. Re-encrypt all data
      const encryptedDataString = window.localStorage.getItem('password-data');
      if (encryptedDataString) {
        const encryptedData = JSON.parse(encryptedDataString);
        const decryptedString = await window.electronCrypto.decrypt(oldKeyHex, encryptedData);
        
        if (!decryptedString) {
          return { success: false, message: 'Failed to decrypt vault data. Aborting.' };
        }
        
        const reEncryptedData = await window.electronCrypto.encrypt(newKeyHex, decryptedString);
        window.localStorage.setItem('password-data', JSON.stringify(reEncryptedData));
      }
      
      // 4. Save new salt and auth check
      window.localStorage.setItem('vault-salt', newSalt);
      window.localStorage.setItem('vault-auth-check', JSON.stringify(newAuthCheck));
      
      // 5. Update state
      setMasterPasswordKey(newKeyHex);
      
      return { success: true };
      
    } catch (error) {
      console.error("Error changing master password:", error);
      return { success: false, message: 'An error occurred while re-encrypting your data.' };
    }
  }, [masterPasswordKey]);

  return (
    <>
      {!isAuthenticated || !masterPasswordKey ? (
        <LoginScreen
          isSetup={hasVault}
          hasMasterPassword_doNotUse={hasVault}
          onLogin={handleLogin}
          onSetup={handleSetup}
          onResetVault={handleResetVault}
        />
      ) : (
        <Dashboard 
          masterPassword={masterPasswordKey} 
          onLock={handleLock} 
          onDeleteVault={handleDeleteVault} 
          onChangeMasterPassword={handleChangeMasterPassword} 
        />
      )}
      {/* <Watermark /> */}
    </>
  );
}

export default App;
