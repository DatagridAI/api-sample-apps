# Frontend for Datagrid Search App

This frontend is a simple HTML, CSS, and JavaScript application that provides a user interface for interacting with the Datagrid Search App backends.

## Features

*   **File Upload**: Allows users to select a file (e.g., CSV, XLS, PDF) and upload it via the chosen backend.
*   **Search**: Allows users to enter a query string and search for files via the chosen backend.
*   **Backend Selection**: A dropdown menu lets users choose whether to send requests to the Python (Flask) backend or the TypeScript (Express) backend.
*   **Results Display**: Shows responses from the backend, whether successful data or error messages.

## Setup and Usage

1.  **Ensure Backends are Running**:
    Before using the frontend, at least one of the backend servers (Python or TypeScript) must be running and accessible.
    *   Python Backend typically runs on `http://localhost:5000`.
    *   TypeScript Backend typically runs on `http://localhost:3000`.
    Refer to their respective READMEs for setup instructions:
    *   [Python Backend README](../backend_python/README.md)
    *   [TypeScript Backend README](../backend_typescript/README.md)

2.  **Open `index.html`:**
    Navigate to the `search_app/frontend/` directory:
    ```bash
    cd path/to/search_app/frontend
    ```
    Open the `index.html` file directly in your web browser (e.g., by double-clicking it or using your browser's "Open File" option). No special build step or web server is required to run this simple frontend.

## How to Use the Interface

1.  **Select Backend**:
    *   Use the dropdown menu labeled "Select Backend:" to choose which backend service (Python or TypeScript) you want to interact with.
    *   The default selection might be Python. Ensure the selected backend is running.

2.  **File Upload**:
    *   Under the "File Upload" section, click the "Choose File" (or similarly labeled) button next to `fileInput`.
    *   Select a file from your local system.
    *   Click the "Upload" button.
    *   The frontend will send the file to the selected backend's `/upload` endpoint.
    *   The response from the backend (or any error) will be displayed in the "Results" area.

3.  **Search**:
    *   Under the "Search" section, type your search query into the text field labeled `searchInput`.
    *   Click the "Search" button.
    *   The frontend will send the query to the selected backend's `/search` endpoint.
    *   The search results (or any error) from the backend will be displayed in the "Results" area, typically as formatted JSON.

4.  **Results**:
    *   The "Results" `div` will show the JSON response from the backend for successful operations or an error message if something went wrong (either on the frontend side, like a network error, or on the backend side).
    *   Error messages are typically displayed in red.
    *   The area will indicate "Uploading..." or "Searching..." while a request is in progress.
