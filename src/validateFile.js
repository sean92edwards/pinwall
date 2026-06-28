/**
 * File validation utility with magic byte (file signature) checking.
 * Prevents upload of malicious files disguised with fake extensions/MIME types.
 */

// Magic byte signatures for allowed image types
const IMAGE_SIGNATURES = [
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF87a or GIF89a
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset4: [0x57, 0x45, 0x42, 0x50] }, // RIFF....WEBP
  { mime: 'image/avif', bytes: [0x00, 0x00, 0x00], skipFirst: true }, // ftyp box (variable first 4 bytes)
];

// Magic byte signatures for allowed audio types
const AUDIO_SIGNATURES = [
  { mime: 'audio/mpeg', bytes: [0xFF, 0xFB] },        // MP3 frame sync
  { mime: 'audio/mpeg', bytes: [0xFF, 0xF3] },        // MP3 frame sync variant
  { mime: 'audio/mpeg', bytes: [0xFF, 0xF2] },        // MP3 frame sync variant
  { mime: 'audio/mpeg', bytes: [0x49, 0x44, 0x33] },  // ID3 tag (MP3 with metadata)
  { mime: 'audio/wav', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header
  { mime: 'audio/ogg', bytes: [0x4F, 0x67, 0x67, 0x53] }, // OggS
  { mime: 'audio/flac', bytes: [0x66, 0x4C, 0x61, 0x43] }, // fLaC
  { mime: 'audio/aac', bytes: [0xFF, 0xF1] },         // AAC ADTS
  { mime: 'audio/aac', bytes: [0xFF, 0xF9] },         // AAC ADTS variant
  { mime: 'audio/mp4', bytes: [0x00, 0x00, 0x00], skipFirst: true }, // ftyp box (M4A)
];

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
const ALLOWED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'mp4', 'webm'];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15MB

/**
 * Reads the first N bytes of a file as a Uint8Array.
 */
function readFileHeader(file, numBytes = 12) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file.slice(0, numBytes));
  });
}

/**
 * Checks if a byte array starts with the given signature bytes.
 */
function matchesSignature(header, signature) {
  for (let i = 0; i < signature.bytes.length; i++) {
    if (header[i] !== signature.bytes[i]) return false;
  }
  // Some formats (WEBP) need a secondary check at offset 8
  if (signature.offset4) {
    for (let i = 0; i < signature.offset4.length; i++) {
      if (header[8 + i] !== signature.offset4[i]) return false;
    }
  }
  return true;
}

/**
 * Checks if a file matches AVIF/MP4 container format (ftyp box).
 * These formats have a variable-length size field in the first 4 bytes,
 * followed by 'ftyp' at offset 4.
 */
function isFtypContainer(header) {
  // Bytes 4-7 should be 'ftyp' (0x66, 0x74, 0x79, 0x70)
  return (
    header[4] === 0x66 &&
    header[5] === 0x74 &&
    header[6] === 0x79 &&
    header[7] === 0x70
  );
}

/**
 * Validates an image file by checking extension, size, and magic bytes.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export async function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image must be under 10MB.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  // Check extension
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File type .${ext} is not allowed. Use: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}.` };
  }

  // Check magic bytes
  try {
    const header = await readFileHeader(file, 12);

    // Special case: AVIF uses ftyp container
    if (ext === 'avif') {
      if (!isFtypContainer(header)) {
        return { valid: false, error: 'File content does not match AVIF format.' };
      }
      return { valid: true };
    }

    // Check against known image signatures
    const matched = IMAGE_SIGNATURES.some(sig => {
      if (sig.skipFirst) return false; // Skip ftyp-based entries here
      return matchesSignature(header, sig);
    });

    if (!matched) {
      return { valid: false, error: 'File content does not match a valid image format. The file may be corrupted or disguised.' };
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Could not read file for validation.' };
  }
}

/**
 * Validates an audio file by checking extension, size, and magic bytes.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export async function validateAudioFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Check file size
  if (file.size > MAX_AUDIO_SIZE) {
    return { valid: false, error: 'Audio must be under 15MB.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  // Check extension
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File type .${ext} is not allowed. Use: ${ALLOWED_AUDIO_EXTENSIONS.join(', ')}.` };
  }

  // Check magic bytes
  try {
    const header = await readFileHeader(file, 12);

    // Special case: M4A/MP4 audio uses ftyp container
    if (ext === 'm4a' || ext === 'mp4') {
      if (!isFtypContainer(header)) {
        return { valid: false, error: 'File content does not match audio container format.' };
      }
      return { valid: true };
    }

    // WebM uses the same EBML header as Matroska video
    if (ext === 'webm') {
      // EBML header starts with 0x1A, 0x45, 0xDF, 0xA3
      if (header[0] === 0x1A && header[1] === 0x45 && header[2] === 0xDF && header[3] === 0xA3) {
        return { valid: true };
      }
      return { valid: false, error: 'File content does not match WebM format.' };
    }

    // Check against known audio signatures
    const matched = AUDIO_SIGNATURES.some(sig => {
      if (sig.skipFirst) return false; // Skip ftyp-based entries here
      return matchesSignature(header, sig);
    });

    if (!matched) {
      return { valid: false, error: 'File content does not match a valid audio format. The file may be corrupted or disguised.' };
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Could not read file for validation.' };
  }
}
