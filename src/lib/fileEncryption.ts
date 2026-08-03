/**
 * MediaCraft Studio - Military Grade Browser AES-256-GCM File Encryption Engine
 * Uses Web Crypto API (SubtleCrypto) with PBKDF2 Key Derivation (100,000 iterations)
 * 100% Client-Side. No servers involved.
 */

const MAGIC_HEADER = new Uint8Array([0x4d, 0x45, 0x4e, 0x43, 0x31]); // "MENC1"

interface EncryptedFileMetadata {
  originalName: string;
  mimeType: string;
  extension: string;
  fileSize: number;
}

/**
 * Derive an AES-256-GCM key from password and salt using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt any file (Image, Video, PDF, ZIP, etc.) with a user password
 */
export async function encryptFileWithPassword(
  file: File,
  password: string
): Promise<{ blob: Blob; encryptedFileName: string }> {
  if (!password || password.trim().length === 0) {
    throw new Error('Password cannot be empty.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);

  // Generate random salt (16 bytes) and IV (12 bytes for AES-GCM)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive CryptoKey
  const aesKey = await deriveKey(password, salt);

  // Encrypt the file data
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    aesKey,
    fileBytes
  );

  const ciphertext = new Uint8Array(ciphertextBuffer);

  // Encode metadata
  const enc = new TextEncoder();
  const fileNameBytes = enc.encode(file.name);
  const mimeBytes = enc.encode(file.type || 'application/octet-stream');
  const extParts = file.name.split('.');
  const ext = extParts.length > 1 ? extParts.pop()! : 'bin';
  const extBytes = enc.encode(ext);

  // Pack header:
  // [MAGIC (5)] + [SALT (16)] + [IV (12)] +
  // [ExtLen (1)] + [ExtBytes] +
  // [MimeLen (1)] + [MimeBytes] +
  // [NameLen (2)] + [NameBytes] +
  // [Ciphertext...]

  const headerLen =
    MAGIC_HEADER.length +
    salt.length +
    iv.length +
    1 +
    extBytes.length +
    1 +
    mimeBytes.length +
    2 +
    fileNameBytes.length;

  const totalLength = headerLen + ciphertext.length;
  const packed = new Uint8Array(totalLength);

  let offset = 0;
  packed.set(MAGIC_HEADER, offset);
  offset += MAGIC_HEADER.length;

  packed.set(salt, offset);
  offset += salt.length;

  packed.set(iv, offset);
  offset += iv.length;

  // Extension
  packed[offset] = extBytes.length;
  offset += 1;
  packed.set(extBytes, offset);
  offset += extBytes.length;

  // Mime
  packed[offset] = mimeBytes.length;
  offset += 1;
  packed.set(mimeBytes, offset);
  offset += mimeBytes.length;

  // Filename length (16-bit uint)
  packed[offset] = (fileNameBytes.length >> 8) & 0xff;
  packed[offset + 1] = fileNameBytes.length & 0xff;
  offset += 2;
  packed.set(fileNameBytes, offset);
  offset += fileNameBytes.length;

  // Append ciphertext
  packed.set(ciphertext, offset);

  const blob = new Blob([packed], { type: 'application/octet-stream' });
  const encryptedFileName = `${file.name}.enc`;

  return { blob, encryptedFileName };
}

/**
 * Inspect an encrypted file (.enc) metadata without decrypting payload
 */
export async function inspectEncryptedFile(file: File): Promise<EncryptedFileMetadata> {
  const headerSlice = await file.slice(0, 1024).arrayBuffer();
  const bytes = new Uint8Array(headerSlice);

  if (bytes.length < 35) {
    throw new Error('Invalid encrypted file format or corrupt file.');
  }

  // Verify magic header
  for (let i = 0; i < MAGIC_HEADER.length; i++) {
    if (bytes[i] !== MAGIC_HEADER[i]) {
      throw new Error('Unrecognized encrypted file header. Ensure this file was encrypted with MediaCraft Vault.');
    }
  }

  let offset = MAGIC_HEADER.length + 16 + 12; // Magic + Salt + IV

  const extLen = bytes[offset];
  offset += 1;
  const dec = new TextDecoder();
  const extension = dec.decode(bytes.subarray(offset, offset + extLen));
  offset += extLen;

  const mimeLen = bytes[offset];
  offset += 1;
  const mimeType = dec.decode(bytes.subarray(offset, offset + mimeLen));
  offset += mimeLen;

  const nameLen = (bytes[offset] << 8) | bytes[offset + 1];
  offset += 2;
  const originalName = dec.decode(bytes.subarray(offset, offset + nameLen));

  return {
    originalName,
    mimeType,
    extension,
    fileSize: file.size,
  };
}

/**
 * Decrypt an encrypted (.enc) file back to its original file format
 */
export async function decryptFileWithPassword(
  file: File,
  password: string
): Promise<{ blob: Blob; originalName: string; mimeType: string }> {
  if (!password) {
    throw new Error('Password is required to decrypt file.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  if (bytes.length < 35) {
    throw new Error('Invalid or corrupted encrypted file.');
  }

  // Check magic header
  for (let i = 0; i < MAGIC_HEADER.length; i++) {
    if (bytes[i] !== MAGIC_HEADER[i]) {
      throw new Error('This file was not encrypted with MediaCraft Studio or header is corrupt.');
    }
  }

  let offset = MAGIC_HEADER.length;

  const salt = bytes.subarray(offset, offset + 16);
  offset += 16;

  const iv = bytes.subarray(offset, offset + 12);
  offset += 12;

  const extLen = bytes[offset];
  offset += 1;
  offset += extLen; // skip extension bytes

  const mimeLen = bytes[offset];
  offset += 1;
  const dec = new TextDecoder();
  const mimeType = dec.decode(bytes.subarray(offset, offset + mimeLen));
  offset += mimeLen;

  const nameLen = (bytes[offset] << 8) | bytes[offset + 1];
  offset += 2;
  const originalName = dec.decode(bytes.subarray(offset, offset + nameLen));
  offset += nameLen;

  const ciphertext = bytes.subarray(offset);

  // Derive key and decrypt
  try {
    const aesKey = await deriveKey(password, salt);
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      aesKey,
      ciphertext
    );

    const decryptedBlob = new Blob([decryptedBuffer], { type: mimeType || 'application/octet-stream' });
    return {
      blob: decryptedBlob,
      originalName,
      mimeType,
    };
  } catch (err) {
    throw new Error('Incorrect password or tampered file data. Decryption failed.');
  }
}
