# TypeScript Datagrid Chatbot

## Overview
This application is an AI-powered customer support chatbot built with TypeScript, utilizing the Datagrid API. It can converse with users and leverage knowledge from uploaded documents.

## Features
*   **Converse API Interaction:** Engages in conversations using the Datagrid Converse API.
*   **Knowledge API Integration:** Supports uploading knowledge files (e.g., FAQs, product documentation) through the Datagrid Knowledge API to provide context-aware responses.
*   **Simple Command-Line Interface (CLI):** Provides an interactive CLI for easy use.

## Setup

1.  **Prerequisites:**
    *   Node.js (version 18.x or later recommended). You can download it from [nodejs.org](https://nodejs.org/).
    *   npm (Node Package Manager), which comes bundled with Node.js.

2.  **Clone/Download:**
    *   Clone this repository or download the source code files into a local directory named `typescript_chatbot`.
    ```bash
    # If it were a git repo (example)
    # git clone <repository_url>
    # cd typescript_chatbot
    ```
    *   For now, ensure you have the `typescript_chatbot` directory with its contents.

3.  **Install Dependencies:**
    *   Navigate to the `typescript_chatbot` directory in your terminal.
    *   Install the project dependencies using npm:
    ```bash
    npm install
    ```
    This command installs runtime dependencies like `axios`, `dotenv`, `form-data`, and development dependencies like `typescript`, `ts-node`, and various `@types` packages as defined in `package.json`.

4.  **API Key:**
    *   A valid Datagrid API key is required for the application to communicate with Datagrid services.
    *   **Environment Variable:** You can set your API key as an environment variable named `DATAGRID_API_KEY`.
        *   Create a `.env` file in the `typescript_chatbot` directory (you can copy `.env.example` and rename it to `.env`).
        *   Add your API key to the `.env` file: `DATAGRID_API_KEY="your_api_key_here"`
    *   **CLI Prompt:** If the `DATAGRID_API_KEY` environment variable is not set (or the `.env` file is not found/configured), the CLI will prompt you to enter the API key when the application starts. It will also offer to save the key to a new `.env` file in the `typescript_chatbot` directory for convenience in future sessions.

## Running the Chatbot

1.  **Navigate to the Directory:**
    *   Open your terminal and ensure you are in the `typescript_chatbot` directory.
    ```bash
    cd path/to/typescript_chatbot
    ```

2.  **Running Options:**

    *   **Development Mode (using ts-node):**
        *   This method compiles and runs the TypeScript code on the fly.
        ```bash
        npm start
        ```

    *   **Production Mode (compile first, then run):**
        1.  **Build/Compile:** Transpile the TypeScript code to JavaScript:
            ```bash
            npm run build
            ```
            This command uses `tsc` (the TypeScript compiler) as configured in `tsconfig.json` and outputs the JavaScript files to the `dist` directory.
        2.  **Run the compiled code:**
            ```bash
            node dist/chatbot.js
            ```
            Alternatively, you can use `npm run start:prod` which combines these two steps.

3.  **CLI Usage:**
    *   **API Key:** If prompted, enter your Datagrid API key.
    *   **Upload Knowledge:** To upload a knowledge file (e.g., the included `example_faq.txt`), type the `upload` command when prompted, and then enter the file path:
        ```
        You: upload
        Enter the path to your knowledge file (e.g., example_faq.txt): example_faq.txt
        ```
        Replace `example_faq.txt` with the correct path to your file. The chatbot will use this knowledge for subsequent answers.
    *   **Ask Questions:** Type your question directly into the prompt and press Enter.
        ```
        You: What are your business hours?
        ```
    *   **Exit:** To quit the application, type:
        ```
        quit
        ```

## Included Files
*   `src/chatbot.ts`: The main TypeScript source file containing the application logic.
*   `package.json`: Defines project metadata, dependencies, and npm scripts.
*   `tsconfig.json`: Configuration file for the TypeScript compiler.
*   `example_faq.txt`: A sample FAQ text file for testing knowledge upload.
*   `.env.example`: An example file showing how to structure the `.env` file for the API key.
*   `.gitignore`: Specifies intentionally untracked files that Git should ignore (like `node_modules`, `dist`, `.env`).
*   `dist/` (after build): Contains the compiled JavaScript code.
