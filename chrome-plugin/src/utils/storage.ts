const API_KEY_STORAGE_KEY = "datagridApiKey";

export async function getApiKey(): Promise<string | undefined> {
  try {
    const result = await chrome.storage.sync.get(API_KEY_STORAGE_KEY);
    return result[API_KEY_STORAGE_KEY];
  } catch (error) {
    console.error("Error getting API key:", error);
    return undefined;
  }
}

export async function setApiKey(apiKey: string): Promise<void> {
  try {
    await chrome.storage.sync.set({ [API_KEY_STORAGE_KEY]: apiKey });
  } catch (error) {
    console.error("Error setting API key:", error);
    throw error;
  }
}

export async function removeApiKey(): Promise<void> {
  try {
    await chrome.storage.sync.remove(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error("Error removing API key:", error);
    throw error;
  }
}
