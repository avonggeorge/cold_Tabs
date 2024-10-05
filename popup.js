document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('save-tabs');
    const restoreButton = document.getElementById('restore-tabs');
    const searchInput = document.getElementById('search');
    const tabsList = document.getElementById('tabs-list');

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

    // Restore tabs
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
        tabsList.innerHTML = '';
        tabs.forEach(tab => {
            const tabItem = document.createElement('div');
            tabItem.className = 'tab-item';
            tabItem.textContent = tab.title;
            tabsList.appendChild(tabItem);
        });
    }

    // Load saved tabs on popup open
    chrome.tabs.query({}, loadTabsList);
});
