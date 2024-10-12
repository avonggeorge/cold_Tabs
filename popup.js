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

    // Load tabs into the list with favicons
    function loadTabsList(tabs) {
        tabsList.innerHTML = '';  // Clear the existing list
        tabs.forEach(tab => {
            const tabItem = document.createElement('div');
            tabItem.className = 'tab-item';

            // Create the favicon image
            const favicon = document.createElement('img');
            favicon.src = tab.favIconUrl || '';  // Use the favicon URL, fallback to an empty string if not available
            favicon.className = 'tab-favicon';
            favicon.onerror = function() {
                favicon.src = 'default-favicon.png'; // Provide a fallback image if favicon fails to load
            };

            // Set the tab title
            const tabTitle = document.createElement('span');
            tabTitle.textContent = tab.title;

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

            // Append elements to the tab item
            tabItem.appendChild(favicon);  // Append favicon
            tabItem.appendChild(tabTitle);  // Append title
            tabItem.appendChild(closeButton);  // Append the close button
            tabsList.appendChild(tabItem);  // Add the tab to the list
        });
    }

    // Load recently closed tabs with favicons
    function loadRecentlyClosedTabs() {
        if (!closedTabsList) return;  // Safeguard if element is missing
        chrome.sessions.getRecentlyClosed(function (sessions) {
            closedTabsList.innerHTML = '';  // Clear the existing list
            sessions.forEach(session => {
                if (session.tab) {
                    const tabItem = document.createElement('div');
                    tabItem.className = 'tab-item';

                    // Create the favicon image
                    const favicon = document.createElement('img');
                    favicon.src = session.tab.favIconUrl || '';  // Use the favicon URL, fallback to an empty string if not available
                    favicon.className = 'tab-favicon';
                    favicon.onerror = function() {
                        favicon.src = 'icons/icon16.png'; // Provide a fallback image if favicon fails to load
                    };

                    // Set the tab title
                    const tabTitle = document.createElement('span');
                    tabTitle.textContent = session.tab.title;

                    // Restore recently closed tab when clicked
                    tabItem.addEventListener('click', function () {
                        chrome.sessions.restore(session.tab.sessionId);  // Restore the closed tab
                    });

                    // Append elements to the tab item
                    tabItem.appendChild(favicon);  // Append favicon
                    tabItem.appendChild(tabTitle);  // Append title
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
