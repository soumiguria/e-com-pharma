// utils/margCrypto.ts
import CryptoJS from 'crypto-js';
import pako from 'pako';

/**
 * Decrypt data using AES/Rijndael with the same settings as C# backend
 * Backend uses: RijndaelManaged with CBC mode, PKCS7 padding, 128-bit key and block size
 */
export function decryptMargData(encryptedBase64: string, key: string): string {
  try {
    console.log('🔐 Starting decryption...');
    console.log('   Encrypted data length:', encryptedBase64.length);
    console.log('   Key:', key);

    // Convert the key to bytes (UTF-8) and pad/truncate to 16 bytes (128 bits)
    const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
    const keyBytes = CryptoJS.lib.WordArray.create();
    
    // Copy up to 16 bytes from the key
    for (let i = 0; i < 4; i++) { // 4 words = 16 bytes
      if (i < keyUtf8.words.length) {
        keyBytes.words[i] = keyUtf8.words[i];
      } else {
        keyBytes.words[i] = 0;
      }
    }
    keyBytes.sigBytes = 16;

    // In the C# code, IV = Key (they use the same 16 bytes)
    const iv = keyBytes.clone();

    console.log('   Key prepared (16 bytes)');
    console.log('   IV = Key (same as C# implementation)');

    // Decrypt using AES (CryptoJS's AES is compatible with Rijndael when using 128-bit blocks)
    const decrypted = CryptoJS.AES.decrypt(
      encryptedBase64,
      keyBytes,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    // Convert to UTF-8 string
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error('Decryption resulted in empty string');
    }

    console.log('✅ Decryption successful');
    console.log('   Decrypted length:', decryptedString.length);
    console.log('   First 100 chars:', decryptedString.substring(0, 100));

    return decryptedString;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw new Error(`Failed to decrypt data: ${error}`);
  }
}

/**
 * Decompress data using DEFLATE algorithm (same as C# DeflateStream)
 * The C# backend uses DeflateStream with CompressionMode.Decompress
 */
export function decompressMargData(compressedBase64: string): string {
  try {
    console.log('🗜️ Starting decompression...');
    console.log('   Compressed data length:', compressedBase64.length);

    // Convert base64 to binary
    const compressedBytes = Uint8Array.from(atob(compressedBase64), c => c.charCodeAt(0));
    console.log('   Compressed bytes length:', compressedBytes.length);

    // Decompress using pako (DEFLATE algorithm)
    const decompressed = pako.inflate(compressedBytes, { to: 'string' });

    console.log('✅ Decompression successful');
    console.log('   Decompressed length:', decompressed.length);
    console.log('   First 100 chars:', decompressed.substring(0, 100));

    return decompressed;
  } catch (error) {
    console.error('❌ Decompression error:', error);
    throw new Error(`Failed to decompress data: ${error}`);
  }
}

/**
 * Try to decompress data, return original if decompression fails
 * Useful when you're not sure if the data is compressed
 */
export function tryDecompress(data: string): string {
  try {
    return decompressMargData(data);
  } catch (error) {
    console.log('⚠️ Decompression failed, returning original data');
    return data;
  }
}

/**
 * Full pipeline: decrypt then decompress (matching C# backend flow)
 * Use this when the backend does: Compress -> Encrypt
 */
export function decryptAndDecompress(encryptedData: string, key: string): string {
  try {
    // Step 1: Decrypt
    const decrypted = decryptMargData(encryptedData, key);
    
    // Step 2: Decompress
    const decompressed = decompressMargData(decrypted);
    
    return decompressed;
  } catch (error) {
    console.error('❌ Decrypt and decompress pipeline error:', error);
    throw error;
  }
}