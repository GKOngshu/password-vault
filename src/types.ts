export interface PasswordEntry {
  id: string;
  name: string;
  website: string;
  username: string;
  email?: string;
  password?: string; // Stored encrypted, so optional here
  notes?: string;
}

// In-memory representation will have the decrypted password
export interface DecryptedPasswordEntry extends PasswordEntry {
  password_decrypted: string;
}

// Adding global Window declaration for Electron Preload API
declare global {
  interface Window {
    electronCrypto: {
      deriveKey: (password: string, salt: string) => Promise<string>;
      encrypt: (keyHex: string, plaintext: string) => Promise<{ iv: string, encryptedData: string, authTag: string }>;
      decrypt: (keyHex: string, encryptedPackage: { iv: string, encryptedData: string, authTag: string }) => Promise<string | null>;
    }
  }
}
