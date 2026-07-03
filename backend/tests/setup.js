/**
 * Test environment setup.
 * Forces an in-memory SQLite database and quiet, deterministic config so
 * tests never touch the real dev database or emit noisy logs.
 */
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.JWT_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.BCRYPT_SALT_ROUNDS = '4';
