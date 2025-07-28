import { Pool } from "pg";

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Initialize database tables
export async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        username VARCHAR(50) UNIQUE,
        display_name VARCHAR(100),
        password_hash VARCHAR(255),
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        passkey_enabled BOOLEAN DEFAULT FALSE,
        biometric_enabled BOOLEAN DEFAULT FALSE,
        wallet_address VARCHAR(255) UNIQUE,
        wallet_type VARCHAR(20),
        photo_url TEXT,
        credentials JSONB,
        verification_tokens JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(6) NOT NULL,
        type VARCHAR(20) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

// User operations
export async function createUser(userData: {
  email?: string;
  phone?: string;
  username?: string;
  displayName?: string;
  passwordHash?: string;
  walletAddress?: string;
  walletType?: string;
}) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, phone, username, display_name, password_hash, wallet_address, wallet_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      userData.email,
      userData.phone,
      userData.username,
      userData.displayName,
      userData.passwordHash || null,
      userData.walletAddress,
      userData.walletType,
    ]
  );
  return rows[0];
}

export async function findUserByEmail(email: string) {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return rows[0] || null;
}

export async function findUserByPhone(phone: string) {
  const { rows } = await pool.query("SELECT * FROM users WHERE phone = $1", [
    phone,
  ]);
  return rows[0] || null;
}

export async function findUserByUsername(username: string) {
  const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return rows[0] || null;
}

export async function findUserById(id: number) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function findUserByWalletAddress(walletAddress: string) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE wallet_address = $1",
    [walletAddress]
  );
  return rows[0] || null;
}

export async function updateUser(
  id: number,
  updates: Partial<{
    emailVerified: boolean;
    phoneVerified: boolean;
    passkeyEnabled: boolean;
    biometricEnabled: boolean;
    walletAddress: string;
    walletType: string;
    photoUrl: string;
    displayName: string;
    email: string;
    phone: string;
    username: string;
    credentials: any[];
  }>
) {
  const setClause = Object.keys(updates)
    .map(
      (key, index) =>
        `${key.replace(/([A-Z])/g, "_$1").toLowerCase()} = $${index + 2}`
    )
    .join(", ");

  const values = Object.values(updates);
  const { rows } = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0];
}

export async function checkUsernameAvailability(username: string) {
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE username = $1",
    [username]
  );
  return rows.length === 0;
}

export async function checkEmailAvailability(email: string) {
  const { rows } = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  return rows.length === 0;
}

export async function checkPhoneAvailability(phone: string) {
  const { rows } = await pool.query("SELECT id FROM users WHERE phone = $1", [
    phone,
  ]);
  return rows.length === 0;
}

export async function checkWalletAvailability(walletAddress: string) {
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE wallet_address = $1",
    [walletAddress]
  );
  return rows.length === 0;
}

// Verification codes
export async function createVerificationCode(
  userId: number,
  code: string,
  type: "email" | "phone"
) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const { rows } = await pool.query(
    `INSERT INTO verification_codes (user_id, code, type, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, code, type, expiresAt]
  );
  return rows[0];
}

export async function verifyCode(
  userId: number,
  code: string,
  type: "email" | "phone"
) {
  const { rows } = await pool.query(
    `SELECT * FROM verification_codes 
     WHERE user_id = $1 AND code = $2 AND type = $3 AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [userId, code, type]
  );

  if (rows.length > 0) {
    // Delete used code
    await pool.query("DELETE FROM verification_codes WHERE id = $1", [
      rows[0].id,
    ]);
    return true;
  }

  return false;
}

export default pool;
