const crypto = require('crypto');

const HASH_SALT = 'fercord_secure_salt_2026';

/**
 * Encripta una contraseña usando PBKDF2 y un salt seguro.
 * @param {string} password 
 * @returns {string} Hash hexadecimal de 128 caracteres.
 */
function hashPassword(password) {
  if (!password) return '';
  return crypto.pbkdf2Sync(password, HASH_SALT, 1000, 64, 'sha256').toString('hex');
}

module.exports = {
  hashPassword
};
