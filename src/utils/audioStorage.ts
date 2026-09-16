/**
 * IndexedDB storage for persisting custom action audio files across app restarts
 */

const DB_NAME = 'kabaddi_scoreboard_audio_v1';
const STORE_NAME = 'action_audio_files';
const DB_VERSION = 1;

export interface StoredAudioRecord {
  actionId: string;
  fileName: string;
  fileType: string;
  blob: Blob;
  updatedAt: number;
}

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'actionId' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Save an audio file blob for a specific action ID
 */
export async function saveAudioBlob(actionId: string, file: File): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record: StoredAudioRecord = {
        actionId,
        fileName: file.name,
        fileType: file.type || 'audio/wav',
        blob: file,
        updatedAt: Date.now(),
      };

      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(`Failed to save audio for ${actionId} to IndexedDB:`, err);
  }
}

/**
 * Retrieve all saved audio files from IndexedDB
 */
export async function getAllAudioBlobs(): Promise<Record<string, { fileName: string; blob: Blob }>> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as StoredAudioRecord[];
        const map: Record<string, { fileName: string; blob: Blob }> = {};
        for (const item of results) {
          map[item.actionId] = {
            fileName: item.fileName,
            blob: item.blob,
          };
        }
        resolve(map);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load audio files from IndexedDB:', err);
    return {};
  }
}

/**
 * Delete saved audio file for an action
 */
export async function deleteAudioBlob(actionId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(actionId);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(`Failed to delete audio for ${actionId} from IndexedDB:`, err);
  }
}
