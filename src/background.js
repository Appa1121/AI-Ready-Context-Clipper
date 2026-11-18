/**
 * Configure the global side panel without depending on worker memory.
 * @returns {Promise<void>} Resolves after configuration; reports sanitized failure.
 */
async function configurePanel() {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch {
    console.error('AI Clipper: side panel configuration failed. Reload the extension.');
  }
}

// Register listeners synchronously before starting asynchronous work.
chrome.runtime.onInstalled.addListener(configurePanel);
chrome.runtime.onStartup.addListener(configurePanel);
void configurePanel();
