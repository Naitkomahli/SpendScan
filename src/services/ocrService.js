import { Image } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MAX_WIDTH = 1600;
const MIN_TEXT_LENGTH = 20;

let engine = null;
let probed = false;

function getEngine() {
  if (probed) return engine;
  probed = true;
  try {
    // Modul native ini memanggil requireNativeModule() saat di-import, jadi harus
    // lazy. Di Expo Go modulnya tidak ada, dan error-nya kita tangkap di sini
    // supaya aplikasi tidak crash.
    engine = require('@infinitered/react-native-mlkit-text-recognition');
  } catch {
    engine = null;
  }
  return engine;
}

export function isOnDeviceOcrAvailable() {
  return Boolean(getEngine()?.recognizeText);
}

function getImageWidth(uri) {
  return new Promise((resolve) => {
    Image.getSize(
      uri,
      (width) => resolve(width),
      () => resolve(null)
    );
  });
}

// Foto kamera biasanya 3000px+. OCR tetap akurat di 1600px dan jauh lebih cepat.
export async function shrinkImage(uri) {
  try {
    const width = await getImageWidth(uri);
    const actions = width && width > MAX_WIDTH ? [{ resize: { width: MAX_WIDTH } }] : [];
    const result = await manipulateAsync(uri, actions, {
      compress: 0.7,
      format: SaveFormat.JPEG,
    });
    return result.uri || uri;
  } catch {
    return uri;
  }
}

/**
 * Baca struk di HP. Kembalikan null kalau ML Kit tidak tersedia (Expo Go)
 * atau tidak ada teks yang terbaca.
 */
export async function recognizeReceipt(uri) {
  const current = getEngine();
  if (!current?.recognizeText) return null;

  try {
    const result = await current.recognizeText(uri);
    const text = String(result?.text || '');
    if (text.trim().length < MIN_TEXT_LENGTH) return null;

    const lines = [];
    for (const block of result?.blocks || []) {
      for (const line of block?.lines || []) {
        if (line?.text) lines.push({ text: line.text, frame: line.frame });
      }
    }

    return {
      text,
      lines: lines.length > 0
        ? lines
        : text.split('\n').map((t) => t.trim()).filter(Boolean),
    };
  } catch {
    return null;
  }
}
