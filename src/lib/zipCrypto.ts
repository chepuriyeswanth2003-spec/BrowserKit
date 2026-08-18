import { inflateRaw } from 'pako';

/**
 * Real classic "ZipCrypto" (PKWARE traditional) decryption for password-protected ZIP
 * archives. JSZip deliberately refuses to read encrypted entries at all — calling
 * entry.async() on one just throws "Encrypted zip are not supported" regardless of any
 * password you pass it. To actually unlock a password-protected ZIP we have to walk the
 * raw archive bytes ourselves (local file headers + PKWARE's stream cipher) rather than
 * going through JSZip for encrypted entries.
 *
 * Only classic ZipCrypto is implemented (the traditional/legacy encryption most consumer
 * zip tools produce, e.g. "Add password" in most zip utilities). Newer WinZip AES
 * encryption (method 99 in the extra field) is detected and reported clearly rather than
 * silently producing garbage output.
 */

export interface DecryptedZipEntry {
  name: string;
  data: Uint8Array;
  isDirectory: boolean;
}

export interface ZipCryptoResult {
  entries: DecryptedZipEntry[];
  skipped: { name: string; reason: string }[];
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

class ZipCryptoKeys {
  key0 = 0x12345678;
  key1 = 0x23456789;
  key2 = 0x34567890;

  constructor(password: string) {
    for (let i = 0; i < password.length; i++) {
      this.updateKeys(password.charCodeAt(i) & 0xff);
    }
  }

  private crc32Byte(crc: number, b: number): number {
    return CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  }

  updateKeys(byteValue: number) {
    this.key0 = this.crc32Byte(this.key0, byteValue) >>> 0;
    this.key1 = (this.key1 + (this.key0 & 0xff)) >>> 0;
    this.key1 = ((Math.imul(this.key1, 134775813) >>> 0) + 1) >>> 0;
    this.key2 = this.crc32Byte(this.key2, this.key1 >>> 24) >>> 0;
  }

  decryptByte(): number {
    const temp = (this.key2 | 2) & 0xffff;
    return (Math.imul(temp, temp ^ 1) >>> 8) & 0xff;
  }

  decryptNext(cipherByte: number): number {
    const plain = (cipherByte ^ this.decryptByte()) & 0xff;
    this.updateKeys(plain);
    return plain;
  }
}

function readUInt32LE(view: DataView, offset: number): number {
  return view.getUint32(offset, true);
}
function readUInt16LE(view: DataView, offset: number): number {
  return view.getUint16(offset, true);
}

/**
 * Parses raw ZIP bytes and decrypts every ZipCrypto-encrypted entry with the given
 * password, inflating the result. Entries using unsupported encryption (AES) or that
 * fail the password check are reported in `skipped` instead of throwing, so the rest
 * of the archive can still come through.
 */
export function decryptZipCryptoArchive(buffer: ArrayBuffer, password: string): ZipCryptoResult {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const entries: DecryptedZipEntry[] = [];
  const skipped: { name: string; reason: string }[] = [];

  const LOCAL_FILE_SIG = 0x04034b50;
  let offset = 0;

  while (offset + 4 <= bytes.length) {
    const sig = readUInt32LE(view, offset);
    if (sig !== LOCAL_FILE_SIG) break; // reached central directory or end of local entries

    const generalPurposeFlag = readUInt16LE(view, offset + 6);
    const compressionMethod = readUInt16LE(view, offset + 8);
    const crc32Expected = readUInt32LE(view, offset + 14);
    const compressedSize = readUInt32LE(view, offset + 18);
    const nameLen = readUInt16LE(view, offset + 26);
    const extraLen = readUInt16LE(view, offset + 28);
    const nameBytes = bytes.slice(offset + 30, offset + 30 + nameLen);
    const name = new TextDecoder('utf-8').decode(nameBytes);
    const extraFieldStart = offset + 30 + nameLen;
    const dataStart = extraFieldStart + extraLen;

    const isEncrypted = (generalPurposeFlag & 0x1) !== 0;
    const isDirectory = name.endsWith('/');

    // Detect WinZip AES encryption (extra field id 0x9901) — not supported here.
    let isAesEncrypted = false;
    if (isEncrypted) {
      let p = extraFieldStart;
      while (p + 4 <= dataStart) {
        const id = readUInt16LE(view, p);
        const len = readUInt16LE(view, p + 2);
        if (id === 0x9901) isAesEncrypted = true;
        p += 4 + len;
      }
    }

    let dataEnd = dataStart + compressedSize;

    if (isDirectory) {
      entries.push({ name, data: new Uint8Array(0), isDirectory: true });
      offset = dataEnd;
      continue;
    }

    if (!isEncrypted) {
      // Not encrypted — decompress normally so the caller gets a consistent result set.
      try {
        const raw = bytes.slice(dataStart, dataEnd);
        const decompressed = compressionMethod === 0 ? raw : inflateRaw(raw);
        entries.push({ name, data: decompressed, isDirectory: false });
      } catch {
        skipped.push({ name, reason: 'Could not decompress entry' });
      }
      offset = dataEnd;
      continue;
    }

    if (isAesEncrypted) {
      skipped.push({ name, reason: 'Uses WinZip AES encryption, which this tool does not support' });
      offset = dataEnd;
      continue;
    }

    if (compressedSize < 12) {
      skipped.push({ name, reason: 'Corrupt entry (too short for encryption header)' });
      offset = dataEnd;
      continue;
    }

    // ZipCrypto: first 12 bytes of the "compressed" data are the encryption header.
    const encHeader = bytes.slice(dataStart, dataStart + 12);
    const cipherData = bytes.slice(dataStart + 12, dataEnd);

    const keys = new ZipCryptoKeys(password);
    const decryptedHeader = new Uint8Array(12);
    for (let i = 0; i < 12; i++) {
      decryptedHeader[i] = keys.decryptNext(encHeader[i]);
    }

    // Verification byte: high byte of CRC (or high byte of mod time, per spec bit 3) —
    // in practice the high byte of the 2-byte DOS time field, which is what most
    // real-world tools check. If it doesn't match, the password is wrong for this entry.
    const checkByteFromTime = (readUInt16LE(view, offset + 10) >> 8) & 0xff;
    const checkByteFromCrc = (crc32Expected >> 24) & 0xff;
    const headerCheckByte = decryptedHeader[11];
    const passwordLooksWrong =
      headerCheckByte !== checkByteFromTime && headerCheckByte !== checkByteFromCrc;

    if (passwordLooksWrong) {
      skipped.push({ name, reason: 'Incorrect password' });
      offset = dataEnd;
      continue;
    }

    const decryptedCipherData = new Uint8Array(cipherData.length);
    for (let i = 0; i < cipherData.length; i++) {
      decryptedCipherData[i] = keys.decryptNext(cipherData[i]);
    }

    try {
      const decompressed = compressionMethod === 0 ? decryptedCipherData : inflateRaw(decryptedCipherData);
      const actualCrc = crc32(decompressed);
      if (crc32Expected !== 0 && actualCrc !== crc32Expected >>> 0) {
        skipped.push({ name, reason: 'Decrypted but failed integrity check (wrong password or corrupt archive)' });
      } else {
        entries.push({ name, data: decompressed, isDirectory: false });
      }
    } catch {
      skipped.push({ name, reason: 'Decrypted but failed to decompress (likely wrong password)' });
    }

    offset = dataEnd;
  }

  return { entries, skipped };
}

/** Quick check so the UI can tell the user up front whether the archive is even encrypted. */
export function isZipEncrypted(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let offset = 0;
  const LOCAL_FILE_SIG = 0x04034b50;
  while (offset + 30 <= bytes.length) {
    const sig = readUInt32LE(view, offset);
    if (sig !== LOCAL_FILE_SIG) break;
    const flag = readUInt16LE(view, offset + 6);
    if (flag & 0x1) return true;
    const compressedSize = readUInt32LE(view, offset + 18);
    const nameLen = readUInt16LE(view, offset + 26);
    const extraLen = readUInt16LE(view, offset + 28);
    offset += 30 + nameLen + extraLen + compressedSize;
  }
  return false;
}
