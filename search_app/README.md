# Datagrid Search Application

## Overview

This project is a web application that allows users to upload files to and search files from a hypothetical "Datagrid API". It consists of three main components:
1.  **Python Backend**: A Flask-based server that provides endpoints for file upload and search, interacting with the Datagrid API.
2.  **TypeScript Backend**: An Express-based server offering the same functionality as the Python backend, also interacting with the Datagrid API.
3.  **Frontend**: An HTML, CSS, and JavaScript single-page application that allows users to interact with either of the backends to upload files and perform searches.

Users can select which backend (Python or TypeScript) they want to use via a dropdown menu in the frontend.

## Prerequisites

*   **Node.js and npm**: For the TypeScript backend and frontend development tools (if any were to be added).
*   **Python 3 and pip**: For the Python backend.
*   **Datagrid API Key**: You will need an account with the (hypothetical) Datagrid service to obtain an API key. This key is required for the backends to authenticate with the Datagrid API.

## Setting the `DATAGRID_API_KEY`

Both backend servers require the `DATAGRID_API_KEY` environment variable to be set to your Datagrid API key.

**Linux/macOS:**
```bash
export DATAGRID_API_KEY="YOUR_API_KEY_HERE"
```

**Windows (PowerShell):**
```powershell
$env:DATAGRID_API_KEY="YOUR_API_KEY_HERE"
```

**Windows (CMD):**
```cmd
set DATAGRID_API_KEY="YOUR_API_KEY_HERE"
```
You may need to restart your terminal or IDE for the variable to be picked up. For production deployments, set this environment variable through your hosting provider's interface.

## Components

### 1. Python Backend (Flask)

*   **Default Port**: `5000`
*   Handles file uploads and search queries by proxying requests to the Datagrid API.
*   For detailed setup and usage instructions, see the [Python Backend README](./backend_python/README.md).

### 2. TypeScript Backend (Express)

*   **Default Port**: `3000`
*   Provides the same functionality as the Python backend, built with Node.js, Express, and TypeScript.
*   For detailed setup and usage instructions, see the [TypeScript Backend README](./backend_typescript/README.md).

### 3. Frontend (HTML, JS, CSS)

*   A simple web interface to upload files and search.
*   Allows selection between the Python and TypeScript backends for API requests.
*   For detailed usage instructions, see the [Frontend README](./frontend/README.md).

---

This README provides a general overview. For specific instructions on setting up and running each component, please refer to their respective README files linked above.
