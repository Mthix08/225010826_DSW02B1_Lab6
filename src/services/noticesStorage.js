import AsyncStorage from '@react-native-async-storage/async-storage';

export const NOTICES_CACHE_KEY = '@uj/notices/cache';
export const NOTICES_LAST_UPDATED_KEY = '@uj/notices/lastUpdated';

export async function getSavedNotices() {
  const [savedNoticesJson, savedLastUpdated] = await Promise.all([
    AsyncStorage.getItem(NOTICES_CACHE_KEY),
    AsyncStorage.getItem(NOTICES_LAST_UPDATED_KEY),
  ]);

  if (savedNoticesJson === null) {
    return { notices: [], lastUpdated: null };
  }

  const savedNotices = JSON.parse(savedNoticesJson);

  if (!Array.isArray(savedNotices)) {
    throw new Error('Saved notices were not a list');
  }

  return { notices: savedNotices, lastUpdated: savedLastUpdated };
}

export async function saveNotices(notices, lastUpdated) {
  await Promise.all([
    AsyncStorage.setItem(NOTICES_CACHE_KEY, JSON.stringify(notices)),
    AsyncStorage.setItem(NOTICES_LAST_UPDATED_KEY, lastUpdated),
  ]);
}

export async function clearSavedNotices() {
  await Promise.all([
    AsyncStorage.removeItem(NOTICES_CACHE_KEY),
    AsyncStorage.removeItem(NOTICES_LAST_UPDATED_KEY),
  ]);
}
