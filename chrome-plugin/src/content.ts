// Example: Listen for messages from the background script
chrome.runtime.onMessage.addListener(
  (request: any, sender: any, sendResponse: any) => {
    console.log("Message received in content script:", request);
    sendResponse({ status: "received in content script" });
  }
);

// Example: Send a message to the background script
chrome.runtime.sendMessage(
  { action: "contentScriptLoaded" },
  (response: any) => {
    console.log("Response from background:", response);
  }
);
