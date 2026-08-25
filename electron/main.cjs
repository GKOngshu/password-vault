const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const crypto = require('crypto');
const argon2 = require('argon2');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // In development, load from the Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // In production, load the built static files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ==========================================
// IPC HANDLERS: Node Crypto & Argon2 Logic
// ==========================================

// 1. Derive a 256-bit (32 byte) key using Argon2id
ipcMain.handle('crypto:deriveKey', async (event, password, saltString) => {
  // Convert salt string to a buffer
  const salt = crypto.createHash('sha256').update(saltString).digest();
  
  // Use Argon2id to derive a raw 32-byte key
  const keyBuffer = await argon2.hash(password, {
    type: argon2.argon2id,
    salt: salt,
    hashLength: 32,
    raw: true, // Returns raw bytes instead of an encoded string
    timeCost: 3,
    memoryCost: 65536, // 64 MB RAM
    parallelism: 4
  });
  
  return keyBuffer.toString('hex');
});

// 2. Encrypt using Node's AES-256-GCM
ipcMain.handle('crypto:encrypt', (event, keyHex, plaintext) => {
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: authTag
  };
});

// 3. Decrypt using Node's AES-256-GCM
ipcMain.handle('crypto:decrypt', (event, keyHex, encryptedPackage) => {
  try {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(encryptedPackage.iv, 'hex');
    const authTag = Buffer.from(encryptedPackage.authTag, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedPackage.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return null;
  }
});
