# Python Backend (Flask) for Datagrid Search App

This backend server is built with Flask and provides API endpoints for uploading files to and searching files from the Datagrid API.

**Default Port**: `5000`

## Prerequisites

*   Python 3 (preferably 3.7+)
*   pip (Python package installer)
*   A `DATAGRID_API_KEY` environment variable set with your Datagrid API key. See the [main project README](../../README.md#setting-the-datagrid_api_key) for instructions.

## Setup

1.  **Navigate to the Python backend directory:**
    ```bash
    cd path/to/search_app/backend_python
    ```

2.  **Create a virtual environment (recommended):**
    ```bash
    python3 -m venv venv
    ```

3.  **Activate the virtual environment:**
    *   On macOS and Linux:
        ```bash
        source venv/bin/activate
        ```
    *   On Windows:
        ```bash
        .\venv\Scripts\activate
        ```

4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Running the Development Server

Ensure your `DATAGRID_API_KEY` environment variable is set.

There are a couple of ways to run the Flask development server:

*   **Using the `flask` command (recommended for development):**
    ```bash
    # Ensure FLASK_APP is set (usually auto-detected if main.py or app.py exists)
    # export FLASK_APP=main.py (if needed)
    # export FLASK_ENV=development (for debug mode, auto-reloading)
    flask run
    ```
    The server will typically start on `http://127.0.0.1:5000/`.

*   **Running the Python script directly:**
    ```bash
    python main.py
    ```
    This will also start the server, and debug mode is enabled in the script's `app.run()` for development.

## Running Tests

Unit tests are provided to ensure the backend functions correctly. The tests mock interactions with the Datagrid API.

1.  **Ensure you are in the `search_app/backend_python` directory.**
2.  **If you created a virtual environment, make sure it's activated.**
3.  **Run the tests using the provided shell script:**
    ```bash
    sh test.sh
    ```
    Alternatively, you can use the Python `unittest` module directly:
    ```bash
    python -m unittest discover tests
    ```
    Or for a specific file:
    ```bash
    python -m unittest tests.test_main
    ```

This will discover and run all tests located in the `tests/` directory.
