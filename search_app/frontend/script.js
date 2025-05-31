document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsDiv = document.getElementById('results');
    const backendSelector = document.getElementById('backendSelector');

    const backendConfig = {
        python: {
            upload: 'http://localhost:5000/upload',
            search: 'http://localhost:5000/search'
        },
        typescript: {
            upload: 'http://localhost:3000/upload',
            search: 'http://localhost:3000/search'
        }
    };

    function displayResult(data, isError = false) {
        resultsDiv.style.color = isError ? 'red' : 'black';
        if (isError) {
            let errorMessage = "An unknown error occurred.";
            if (typeof data === 'string') {
                errorMessage = data;
            } else if (data && typeof data === 'object') {
                if (data.error) {
                    errorMessage = `Error: ${data.error}`;
                    if (data.details) {
                        errorMessage += `\nDetails: ${typeof data.details === 'object' ? JSON.stringify(data.details, null, 2) : data.details}`;
                    }
                } else {
                    errorMessage = `Error: ${JSON.stringify(data, null, 2)}`;
                }
            }
            resultsDiv.textContent = errorMessage;
        } else {
            resultsDiv.textContent = JSON.stringify(data, null, 2);
        }
    }

    if (uploadButton) {
        uploadButton.addEventListener('click', async () => {
            resultsDiv.textContent = ''; // Clear previous results
            if (!fileInput.files || fileInput.files.length === 0) {
                displayResult('Please select a file to upload.', true);
                return;
            }

            const file = fileInput.files[0];
            const selectedBackend = backendSelector.value;
            const uploadUrl = backendConfig[selectedBackend]?.upload;

            if (!uploadUrl) {
                displayResult('Invalid backend selected for upload.', true);
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            resultsDiv.textContent = 'Uploading...';
            // resultsDiv.style.color = 'black'; // Set by displayResult

            try {
                const response = await fetch(uploadUrl, {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json(); // Try to parse JSON regardless of response.ok
                if (!response.ok) {
                    // data here is the parsed error response from backend
                    throw data;
                }
                displayResult(data);
            } catch (error) {
                console.error('Upload error:', error);
                // If error is not already a structured object from backend (e.g. network error)
                // display a generic message or error.message
                if (error instanceof Error) { // Network error or similar
                     displayResult(error.message, true);
                } else { // Error object from backend
                     displayResult(error || { error: 'Failed to upload file.' }, true);
                }
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', async () => {
            resultsDiv.textContent = ''; // Clear previous results
            const query = searchInput.value;
            if (!query.trim()) {
                displayResult('Please enter a search query.', true);
                return;
            }

            const selectedBackend = backendSelector.value;
            const searchUrlBase = backendConfig[selectedBackend]?.search;

            if (!searchUrlBase) {
                displayResult('Invalid backend selected for search.', true);
                return;
            }

            const searchUrl = `${searchUrlBase}?query=${encodeURIComponent(query)}`;

            resultsDiv.textContent = 'Searching...';
            // resultsDiv.style.color = 'black'; // Set by displayResult

            try {
                const response = await fetch(searchUrl, {
                    method: 'GET',
                });
                const data = await response.json(); // Try to parse JSON regardless of response.ok
                 if (!response.ok) {
                    // data here is the parsed error response from backend
                    throw data;
                }
                displayResult(data);
            } catch (error) {
                console.error('Search error:', error);
                // If error is not already a structured object from backend (e.g. network error)
                // display a generic message or error.message
                if (error instanceof Error) { // Network error or similar
                    displayResult(error.message, true);
                } else { // Error object from backend
                    displayResult(error || { error: 'Failed to perform search.' }, true);
                }
            }
        });
    }
});
