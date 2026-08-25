const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronCrypto', {
  deriveKey: (password, salt) => ipcRenderer.invoke('crypto:deriveKey', password, salt),
  encrypt: (keyHex, plaintext) => ipcRenderer.invoke('crypto:encrypt', keyHex, plaintext),
  decrypt: (keyHex, encryptedPackage) => ipcRenderer.invoke('crypto:decrypt', keyHex, encryptedPackage)
});
