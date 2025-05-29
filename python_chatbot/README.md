# Python Datagrid Chatbot

## Overview
This application is an AI-powered customer support chatbot that utilizes the Datagrid API. It can answer user queries based on provided knowledge sources.

## Features
*   **Converse API Interaction:** Ask questions and get answers from the Datagrid Converse API.
*   **Knowledge API Integration:** Upload knowledge files (like FAQs or other documents) to enhance the chatbot's knowledge base using the Datagrid Knowledge API.
*   **Simple Command-Line Interface (CLI):** Easy-to-use CLI for interacting with the chatbot.

## Setup

1.  **Prerequisites:**
    *   Python 3.x (Python 3.7 or newer recommended).

2.  **Clone/Download:**
    *   Clone this repository or download the source code files into a local directory.
    ```bash
    # If it were a git repo (example)
    # git clone <repository_url>
    # cd python_chatbot
    ```
    *   For now, ensure you have the `python_chatbot` directory with its contents.

3.  **Install Dependencies:**
    *   Navigate to the `python_chatbot` directory in your terminal.
    *   Install the required Python packages using pip:
    ```bash
    pip install -r requirements.txt
    ```

4.  **API Key:**
    *   The application requires a valid Datagrid API key to function.
    *   You can set your API key as an environment variable named `DATAGRID_API_KEY`.
        *   Example (Linux/macOS): `export DATAGRID_API_KEY="your_api_key_here"`
        *   Example (Windows CMD): `set DATAGRID_API_KEY="your_api_key_here"`
        *   Example (Windows PowerShell): `$env:DATAGRID_API_KEY="your_api_key_here"`
    *   Alternatively, if the `DATAGRID_API_KEY` environment variable is not set, the CLI will prompt you to enter it when you first run the application. It will also offer to save the key in a `.env` file within the `python_chatbot` directory for future sessions.

## Running the Chatbot

1.  **Navigate to the Directory:**
    *   Open your terminal and change to the `python_chatbot` directory.
    ```bash
    cd path/to/python_chatbot
    ```

2.  **Run the Application:**
    *   Execute the main chatbot script:
    ```bash
    python chatbot.py
    ```

3.  **CLI Usage:**
    *   **API Key:** If prompted, enter your Datagrid API key.
    *   **Upload Knowledge:** To upload a knowledge file (e.g., the included `example_faq.txt`), type:
        ```
        upload example_faq.txt
        ```
        Replace `example_faq.txt` with the actual path to your file if it's different or located elsewhere. The chatbot will use the uploaded knowledge for subsequent answers.
    *   **Ask Questions:** Type your question directly into the prompt and press Enter.
        ```
        You: What are your business hours?
        ```
    *   **Exit:** To quit the application, type:
        ```
        quit
        ```

## Included Files
*   `chatbot.py`: The main Python script containing the application logic.
*   `requirements.txt`: A list of Python dependencies required for the project.
*   `example_faq.txt`: A sample FAQ text file that can be used for testing the knowledge upload feature.
*   `.env` (optional, created by user): Stores the `DATAGRID_API_KEY` if saved via the CLI.
