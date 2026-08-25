import { useState, useEffect, useCallback } from 'react';


export function useLocalStorage<T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Use a functional update to ensure we always have the latest state.
      setStoredValue(currentStoredValue => {
        const valueToStore = value instanceof Function ? value(currentStoredValue) : value;
        
        // If the new value is null/undefined, remove it from storage. Otherwise, set it.
        if (valueToStore === null || valueToStore === undefined) {
            window.localStorage.removeItem(key);
        } else {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

export function useEncryptedLocalStorage<T,>(
  key: string,
  initialValue: T,
  encryptionKeyHex: string | null
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  
  const [decryptedValue, setDecryptedValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data initially
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!encryptionKeyHex) {
        if (isMounted) {
          setDecryptedValue(initialValue);
          setIsLoading(false);
        }
        return;
      }
      
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const encryptedPackage = JSON.parse(item);
          const decryptedString = await window.electronCrypto.decrypt(encryptionKeyHex, encryptedPackage);
          
          if (decryptedString && isMounted) {
            setDecryptedValue(JSON.parse(decryptedString));
          } else if (isMounted) {
            setDecryptedValue(initialValue);
          }
        }
      } catch (error) {
        console.error('Failed to read or decrypt from local storage', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    setIsLoading(true);
    loadData();
    
    return () => { isMounted = false; };
  }, [encryptionKeyHex, key]);

  // Save data
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (!encryptionKeyHex) return;

    setDecryptedValue(currentValue => {
      const valueToStore = value instanceof Function ? value(currentValue) : value;
      
      // Run encryption async, but update React state sync to keep UI snappy
      (async () => {
        try {
          const stringifiedValue = JSON.stringify(valueToStore);
          const encryptedPackage = await window.electronCrypto.encrypt(encryptionKeyHex, stringifiedValue);
          window.localStorage.setItem(key, JSON.stringify(encryptedPackage));
        } catch (error) {
          console.error('Failed to encrypt or save to local storage', error);
        }
      })();
      
      return valueToStore;
    });
  }, [encryptionKeyHex, key]);

  return [decryptedValue, setValue, isLoading];
}