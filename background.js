// background.js — diagnostic listener for storage changes
// This will log storage.onChanged events so you can inspect them in the Service Worker console.
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    try {
      console.log('[background] storage.onChanged', areaName, changes);
      // optional: update badge when monster count changes
      if (areaName === 'sync' && (changes.count || changes.monsterCount)) {
        const val = Number((changes.count || changes.monsterCount).newValue) || 0;
        if (chrome.action && chrome.action.setBadgeText) {
          chrome.action.setBadgeText({ text: String(val) });
        }
      }
    } catch (e) {
      console.error('[background] onChanged handler error', e);
    }
  });
} else {
  console.log('[background] chrome.storage.onChanged not available');
}
