let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    // Save ref to database
    const db = event.target.result;

    // created object store to store budget data offline
    db.createObjectStore('update_budget', { autoIncrement: true });
};

// if successful
request.onsuccess = function(event) {
    db = event.target.result;

    // check if application is online or not
    if (navigator.onLine) {
        // uploadBudget();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['update_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('update_budget');

    // add to the store
    budgetObjectStore.add(record)
};

function uploadBudget() {
    const transaction = db.transaction(['update_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('update_budget');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['update_budget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('update_budget');
                budgetObjectStore.clear();

                alert('All saved budget data has been submitted!');
            })
            .catch(err => console.log(err));
        }
    };
};

window.addEventListener('online', uploadBudget);