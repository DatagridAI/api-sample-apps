# TypeScript Backend (Express) for Datagrid Search App

This backend server is built with Node.js, Express, and TypeScript. It provides API endpoints for uploading files to and searching files from the Datagrid API.

**Default Port**: `3000`

## Prerequisites

*   Node.js (preferably a recent LTS version)
*   npm (Node Package Manager, comes with Node.js)
*   A `DATAGRID_API_KEY` environment variable set with your Datagrid API key. See the [main project README](../../README.md#setting-the-datagrid_api_key) for instructions.

## Setup

1.  **Navigate to the TypeScript backend directory:**
    ```bash
    cd path/to/search_app/backend_typescript
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    This will install all necessary packages defined in `package.json`, including Express, Axios, Multer, and TypeScript development tools.

## Development

1.  **Running the development server:**
    Ensure your `DATAGRID_API_KEY` environment variable is set.
    ```bash
    npm run dev
    ```
    This command uses `nodemon` to monitor your `src/` directory for changes and automatically restarts the server. It uses `ts-node` to run TypeScript directly without a separate build step. The server will typically start on `http://localhost:3000/`.

2.  **Building the project:**
    To compile the TypeScript code into JavaScript (output to the `dist/` directory as per `tsconfig.json`):
    ```bash
    npm run build
    ```

## Production

1.  **Ensure the project is built:**
    Run `npm run build` if you haven't already.

2.  **Running the production server:**
    Ensure your `DATAGRID_API_KEY` environment variable is set.
    ```bash
    npm start
    ```
    This command runs the compiled JavaScript code from the `dist/` directory using `ts-node` (though for a pure JS start, you might use `node dist/index.js` if `ts-node` isn't desired in production, but the current script uses `ts-node`).

## Running Tests

Unit tests are provided using Jest and Supertest to ensure the backend functions correctly. The tests mock interactions with the Datagrid API.

1.  **Ensure you are in the `search_app/backend_typescript` directory.**
2.  **Run the tests:**
    ```bash
    npm test
    ```
    This command will execute all test files found in `src/__tests__` (as configured in `jest.config.js`). Jest will provide a summary of test results, including coverage.
