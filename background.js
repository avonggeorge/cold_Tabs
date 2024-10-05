chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ savedTabs: [] }, function () {
        console.log("Tab manager extension installed.");
    });
});
