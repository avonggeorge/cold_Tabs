document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('save-tabs');
    const restoreButton = document.getElementById('restore-tabs');
    const searchInput = document.getElementById('search');
    const tabsList = document.getElementById('tabs-list');
    const closedTabsList = document.getElementById('closed-tabs-list');  // Added closed tabs list
    
    // Save all open tabs
    saveButton.addEventListener('click', function () {
        chrome.tabs.query({}, function (tabs) {
            const tabsData = tabs.map(tab => ({
                url: tab.url,
                title: tab.title
            }));
            chrome.storage.sync.set({ savedTabs: tabsData }, function () {
                console.log("Tabs saved.");
                loadTabsList(tabsData);
            });
        });
    });

    // Restore all saved tabs
    restoreButton.addEventListener('click', function () {
        chrome.storage.sync.get('savedTabs', function (data) {
            const savedTabs = data.savedTabs || [];
            savedTabs.forEach(tab => chrome.tabs.create({ url: tab.url }));
        });
    });

    // Search tabs
    searchInput.addEventListener('input', function () {
        const searchTerm = searchInput.value.toLowerCase();
        chrome.tabs.query({}, function (tabs) {
            const filteredTabs = tabs.filter(tab =>
                tab.title.toLowerCase().includes(searchTerm)
            );
            loadTabsList(filteredTabs);
        });
    });

    // Load tabs into the list
    function loadTabsList(tabs) {
        tabsList.innerHTML = '';  // Clear the existing list
        tabs.forEach(tab => {
            const tabItem = document.createElement('div');
            tabItem.className = 'tab-item';
            tabItem.textContent = tab.title;

            // Make tab title clickable to restore tab
            tabItem.addEventListener('click', function () {
                chrome.tabs.create({ url: tab.url });  // Open the tab when clicked
            });

            // Add close button for each tab
            const closeButton = document.createElement('button');
            closeButton.textContent = 'X';  // Close button label
            closeButton.className = 'close-button';
            
            // Close tab when the close button is clicked
            closeButton.addEventListener('click', function (e) {
                e.stopPropagation();  // Prevent the tab from opening when closing it
                chrome.tabs.remove(tab.id);  // Close the tab
            });

            tabItem.appendChild(closeButton);  // Append the close button to the tab item
            tabsList.appendChild(tabItem);  // Add the tab to the list
        });
    }

    // Load recently closed tabs
    function loadRecentlyClosedTabs() {
        chrome.sessions.getRecentlyClosed(function (sessions) {
            closedTabsList.innerHTML = '';  // Clear the existing list
            sessions.forEach(session => {
                if (session.tab) {
                    const tabItem = document.createElement('div');
                    tabItem.className = 'tab-item';
                    tabItem.textContent = session.tab.title;

                    // Restore recently closed tab when clicked
                    tabItem.addEventListener('click', function () {
                        chrome.sessions.restore(session.tab.sessionId);  // Restore the closed tab
                    });

                    closedTabsList.appendChild(tabItem);  // Add the closed tab to the list
                }
            });
        });
    }

    // Load open tabs on popup open
    chrome.tabs.query({}, loadTabsList);

    // Load recently closed tabs on popup open
    loadRecentlyClosedTabs();
});
