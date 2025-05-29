import axios, { AxiosError } from 'axios';
import * as fs from 'fs';
import * as readline from 'readline';
import FormData from 'form-data';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const DATAGRID_API_URL_CONVERSE = "https://api.datagrid.com/v1/converse";
const DATAGRID_API_URL_FILES = "https://api.datagrid.com/v1/files";
const DATAGRID_API_URL_KNOWLEDGE = "https://api.datagrid.com/v1/knowledge";

interface ConverseResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
    // Add other fields if necessary based on actual API response
}

interface FileUploadResponse {
    id: string;
    // Add other fields if necessary
}

interface KnowledgeCreateResponse {
    id: string;
    // Add other fields if necessary
}

/**
 * Sends a prompt to the Datagrid chatbot API and returns the response.
 * @param prompt The user's prompt.
 * @param apiKey The Datagrid API key.
 * @param knowledgeIds Optional list of knowledge IDs to use.
 * @returns The chatbot's text reply.
 */
async function askChatbot(prompt: string, apiKey: string, knowledgeIds?: string[]): Promise<string> {
    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
    };

    const payload: {
        prompt: string;
        config: {
            agent_model: string;
            llm_model: string;
            stream: boolean;
            generate_citations: boolean;
            knowledge_ids?: string[];
        }
    } = {
        prompt: prompt,
        config: {
            agent_model: "magpie-1",
            llm_model: "gemini-1.5-flash-001",
            stream: false,
            generate_citations: false,
        }
    };

    if (knowledgeIds && knowledgeIds.length > 0) {
        payload.config.knowledge_ids = knowledgeIds;
    }

    try {
        const response = await axios.post<ConverseResponse>(DATAGRID_API_URL_CONVERSE, payload, { headers });
        if (response.data && response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message) {
            return response.data.choices[0].message.content;
        }
        return "Sorry, I could not get a valid response.";
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error("API Request Error details:", axiosError.response?.data || axiosError.message);
            return `API Request Error: ${axiosError.message}`;
        }
        console.error("Unexpected error in askChatbot:", error);
        return `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`;
    }
}

/**
 * Uploads a file to Datagrid, creates knowledge from it, and returns the knowledge_id.
 * @param filepath Path to the file to upload.
 * @param apiKey The Datagrid API key.
 * @returns The knowledge_id.
 */
async function uploadKnowledgeFromFile(filepath: string, apiKey: string): Promise<string> {
    const fileUploadHeaders = {
        "Authorization": `Bearer ${apiKey}`,
        // Content-Type will be set by FormData
    };

    try {
        const formData = new FormData();
        const fileStream = fs.createReadStream(filepath);
        formData.append('file', fileStream, path.basename(filepath));

        // Step 1: Upload the file
        const fileResponse = await axios.post<FileUploadResponse>(
            DATAGRID_API_URL_FILES,
            formData,
            { headers: { ...fileUploadHeaders, ...formData.getHeaders() } } // Merge headers
        );

        const fileId = fileResponse.data.id;
        if (!fileId) {
            return "Error: Could not get file_id from file upload response.";
        }

        // Step 2: Create knowledge from the uploaded file
        const knowledgeCreateHeaders = {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        };
        const knowledgePayload = {
            file_ids: [fileId],
            name: path.basename(filepath),
        };

        const knowledgeResponse = await axios.post<KnowledgeCreateResponse>(
            DATAGRID_API_URL_KNOWLEDGE,
            knowledgePayload,
            { headers: knowledgeCreateHeaders }
        );

        const knowledgeId = knowledgeResponse.data.id;
        if (!knowledgeId) {
            return "Error: Could not get knowledge_id from knowledge creation response.";
        }
        return knowledgeId;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error("API Request Error during knowledge upload:", axiosError.response?.data || axiosError.message);
            return `API Request Error: ${axiosError.message}`;
        } else if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.error(`File not found at ${filepath}`, error);
            return `Error: File not found at ${filepath}`;
        }
        console.error("Unexpected error in uploadKnowledgeFromFile:", error);
        return `An unexpected error occurred during upload: ${error instanceof Error ? error.message : String(error)}`;
    }
}

async function mainCli(): Promise<void> {
    let apiKey: string | undefined = process.env.DATAGRID_API_KEY;
    let knowledgeId: string | undefined;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    function askQuestion(query: string): Promise<string> {
        return new Promise((resolve) => {
            rl.question(query, resolve);
        });
    }

    if (!apiKey) {
        apiKey = await askQuestion("Enter your Datagrid API Key: ");
        if (!apiKey || apiKey.trim() === "") {
            console.log("API Key is required. Exiting.");
            rl.close();
            return;
        }
        const saveKey = await askQuestion("Do you want to save this API key to a .env file for future sessions? (yes/no): ");
        if (saveKey.toLowerCase() === 'yes') {
            try {
                // Check if .env file exists, if so, append. Otherwise, create.
                const envPath = path.join(process.cwd(), '.env'); // Assumes .env in the current working directory
                let envContent = "";
                if (fs.existsSync(envPath)) {
                    envContent = fs.readFileSync(envPath, 'utf-8');
                    if (envContent.length > 0 && !envContent.endsWith('\n')) {
                        envContent += '\n';
                    }
                }
                envContent += `DATAGRID_API_KEY=${apiKey}\n`;
                fs.writeFileSync(envPath, envContent);
                console.log("API Key saved to .env file. Please restart the application to use it from .env or continue with the current session.");
            } catch (err) {
                console.error("Failed to save API key to .env file:", err);
            }
        }
    }

    console.log("\nAI Customer Support Chatbot");
    console.log("Type 'upload' to upload a knowledge file.");
    console.log("Type 'quit' to exit.");

    rl.on('line', async (line) => {
        const input = line.trim().toLowerCase();

        if (input === 'quit') {
            console.log("Exiting chatbot. Goodbye!");
            rl.close();
            return;
        }

        if (!apiKey) { // Should not happen if initial check is done, but as a safeguard
            console.log("API Key is not set. Please restart and provide an API Key.");
            rl.prompt();
            return;
        }

        if (input === 'upload') {
            const filepath = await askQuestion("Enter the path to your knowledge file (e.g., example_faq.txt): ");
            if (!fs.existsSync(filepath.trim())) {
                console.log(`File not found: ${filepath.trim()}`);
                rl.prompt();
                return;
            }
            console.log(`Uploading ${filepath.trim()}...`);
            const result = await uploadKnowledgeFromFile(filepath.trim(), apiKey);
            if (result.startsWith("Error:")) {
                console.log(`Knowledge upload failed: ${result}`);
            } else {
                knowledgeId = result;
                console.log(`Knowledge file uploaded successfully. Knowledge ID: ${knowledgeId}`);
            }
        } else {
            console.log("Chatbot is thinking...");
            const currentKnowledgeIds = knowledgeId ? [knowledgeId] : undefined;
            const response = await askChatbot(line.trim(), apiKey, currentKnowledgeIds);
            console.log(`Chatbot: ${response}`);
        }
        rl.prompt();
    });

    rl.prompt();
}

mainCli().catch(error => {
    console.error("Critical error in CLI:", error);
});
