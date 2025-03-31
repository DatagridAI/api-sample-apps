import { getApiKey } from "./utils/storage";

// Background script
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Datagrid Assistant extension installed");

  // Set up the side panel behavior
  await chrome.sidePanel.setOptions({
    enabled: true,
    path: "sidepanel.html",
  });

  // Configure panel to open on extension icon click
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  // Check if API key exists and open options page if it doesn't
  const apiKey = await getApiKey();
  if (!apiKey) {
    void chrome.runtime.openOptionsPage();
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined) {
    return;
  }

  try {
    const apiKey = await getApiKey();
    if (apiKey === undefined) {
      // If no API key is set, open the options page
      void chrome.runtime.openOptionsPage();
    }
    // The side panel will open automatically due to the setPanelBehavior setting
  } catch (error) {
    console.error("Error handling extension click:", error);
    void chrome.runtime.openOptionsPage();
  }
});

// Listen for runtime messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background script received message:", message);

  if (message.type === "GET_PAGE_CONTENT") {
    console.log("Getting page content for tab:", sender.tab?.id);

    // Execute script in the active tab
    chrome.scripting
      .executeScript({
        target: { tabId: sender.tab?.id ?? -1 },
        func: () => {
          const selection = window.getSelection()?.toString() ?? "";
          const pageText = document.body.innerText;
          return { selection, pageText };
        },
      })
      .then((results) => {
        console.log("Got page content:", results);
        sendResponse(results[0].result);
      })
      .catch((error) => {
        console.error("Error executing script:", error);
        sendResponse({ error: error.message });
      });

    return true; // Keep the message channel open for async response
  }
});
