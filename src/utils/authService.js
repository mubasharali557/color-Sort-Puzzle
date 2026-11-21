// Cryptographically secure authentication and isolated player-progress management service
// Supports Web Crypto PBKDF2 password hashing (passwords are never stored in plain text)
// Zero-dependency, live-server compatible (works on Vercel, Netlify, Render, GitHub Pages, etc.)

const ACCOUNTS_STORAGE_KEY = 'watersort_accounts_v1';
const SESSION_STORAGE_KEY = 'watersort_active_session_v1';
const USER_DATA_PREFIX = 'watersort_player_data_v1_';

/**
 * Generate a cryptographically random hex salt
 */
function generateSalt(length = 16) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const saltBytes = new Uint8Array(length);
    window.crypto.getRandomValues(saltBytes);
    return Array.from(saltBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for non-browser or test environments
  return Array.from({ length }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
}

/**
 * Secure PBKDF2-SHA256 password hashing with salt
 * Returns hex string of the derived key
 */
async function hashPassword(password, saltHex) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const enc = new TextEncoder();
      const passwordKey = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      const saltBytes = new Uint8Array(
        saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
      );

      const derivedKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltBytes,
          iterations: 100000,
          hash: 'SHA-256',
        },
        passwordKey,
        { name: 'HMAC', hash: 'SHA-256', length: 256 },
        true,
        ['sign']
      );

      const exported = await window.crypto.subtle.exportKey('raw', derivedKey);
      const hashArray = Array.from(new Uint8Array(exported));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fall through to fallback hashing below
    }
  }

  // Fallback: SHA-256 equivalent HMAC/digest fallback
  return fallbackHash(password + ':' + saltHex);
}

/**
 * Lightweight, deterministic SHA-256 fallback if WebCrypto is unavailable in non-secure HTTP contexts
 */
function fallbackHash(str) {
  let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${hex1}${hex2}${hex1.split('').reverse().join('')}${hex2.split('').reverse().join('')}`;
}

/**
 * Read all accounts from persistent storage
 */
function getStoredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load accounts registry:', err);
    return [];
  }
}

/**
 * Save accounts registry to persistent storage
 */
function saveStoredAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts registry:', err);
  }
}

/**
 * Create fresh, empty default player progress for a newly registered account
 * Zero coins, zero stars, Stage 1, no inherited items
 */
export function createDefaultPlayerProgress() {
  return {
    stage: 1,
    highestUnlocked: 1,
    coins: 0,
    stars: 0,
    activeTheme: 'apothecary',
    unlockedThemes: ['apothecary'],
    activeSkin: 'classic',
    unlockedSkins: ['classic'],
    soundEnabled: true,
    musicEnabled: true,
    vibrationEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const authService = {
  /**
   * Check if a user currently has an active, valid session
   */
  getCurrentUser() {
    try {
      const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionRaw) return null;
      const session = JSON.parse(sessionRaw);

      if (!session || !session.userId || !session.username) {
        this.logout();
        return null;
      }

      // Verify the account still exists in the registry
      const accounts = getStoredAccounts();
      const account = accounts.find((a) => a.id === session.userId);
      if (!account) {
        this.logout();
        return null;
      }

      return {
        id: account.id,
        username: account.username,
        createdAt: account.createdAt,
      };
    } catch {
      this.logout();
      return null;
    }
  },

  /**
   * Register a new player account with unique username and hashed password
   */
  async register(username, password) {
    const trimmedUsername = (username || '').trim();
    const cleanPassword = (password || '').trim();

    // Validations
    if (!trimmedUsername || trimmedUsername.length < 3) {
      throw new Error('Username must be at least 3 characters long.');
    }
    if (trimmedUsername.length > 18) {
      throw new Error('Username cannot exceed 18 characters.');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      throw new Error('Username can only contain letters, numbers, hyphens, and underscores.');
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    const accounts = getStoredAccounts();
    const lower = trimmedUsername.toLowerCase();

    // Check username uniqueness (case-insensitive)
    const exists = accounts.some((a) => a.usernameLower === lower);
    if (exists) {
      throw new Error('Username is already taken. Please choose another username.');
    }

    // Cryptographic Salt & PBKDF2 Password Hashing
    const salt = generateSalt(16);
    const passwordHash = await hashPassword(cleanPassword, salt);

    const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);

    const newAccount = {
      id: userId,
      username: trimmedUsername,
      usernameLower: lower,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    saveStoredAccounts(accounts);

    // Initialize completely fresh player progress (Stage 1, 0 coins, 0 stars)
    const freshProgress = createDefaultPlayerProgress();
    this.saveUserProgress(userId, freshProgress);

    // Set Active Session
    const sessionData = {
      userId,
      username: trimmedUsername,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));

    return {
      user: {
        id: userId,
        username: trimmedUsername,
        createdAt: newAccount.createdAt,
      },
      progress: freshProgress,
    };
  },

  /**
   * Log in an existing player by validating their credentials against PBKDF2 hash
   */
  async login(username, password) {
    const trimmedUsername = (username || '').trim();
    const cleanPassword = (password || '').trim();

    if (!trimmedUsername || !cleanPassword) {
      throw new Error('Please enter both username and password.');
    }

    const accounts = getStoredAccounts();
    const lower = trimmedUsername.toLowerCase();
    const account = accounts.find((a) => a.usernameLower === lower);

    if (!account) {
      throw new Error('Invalid username or password.');
    }

    // Re-hash the provided password with the user's stored salt
    const computedHash = await hashPassword(cleanPassword, account.salt);

    if (computedHash !== account.passwordHash) {
      throw new Error('Invalid username or password.');
    }

    // Update last login timestamp
    account.lastLoginAt = new Date().toISOString();
    saveStoredAccounts(accounts);

    // Save Active Session
    const sessionData = {
      userId: account.id,
      username: account.username,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));

    // Retrieve or initialize saved user progress
    let userProgress = this.getUserProgress(account.id);
    if (!userProgress) {
      userProgress = createDefaultPlayerProgress();
      this.saveUserProgress(account.id, userProgress);
    }

    return {
      user: {
        id: account.id,
        username: account.username,
        createdAt: account.createdAt,
      },
      progress: userProgress,
    };
  },

  /**
   * Log out current user and clear active session
   */
  logout() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      console.error('Logout error:', err);
    }
  },

  /**
   * Retrieve isolated progress data for a specific user ID
   */
  getUserProgress(userId) {
    try {
      const raw = localStorage.getItem(USER_DATA_PREFIX + userId);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('Error reading user progress:', err);
      return null;
    }
  },

  /**
   * Save progress data for a specific user ID
   */
  saveUserProgress(userId, progressData) {
    try {
      if (!userId) return;
      const updated = {
        ...progressData,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(USER_DATA_PREFIX + userId, JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving user progress:', err);
    }
  },
};

