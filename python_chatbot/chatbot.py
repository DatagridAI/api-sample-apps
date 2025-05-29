import requests
import os
from dotenv import load_dotenv
import json

# Load environment variables from .env file if it exists
load_dotenv()

DATAGRID_API_URL_CONVERSE = "https://api.datagrid.com/v1/converse"
DATAGRID_API_URL_FILES = "https://api.datagrid.com/v1/files"
DATAGRID_API_URL_KNOWLEDGE = "https://api.datagrid.com/v1/knowledge"

def ask_chatbot(prompt: str, api_key: str, knowledge_ids: list[str] = None) -> str:
    """
    Sends a prompt to the Datagrid chatbot API and returns the response.
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "prompt": prompt,
        "config": {
            "agent_model": "magpie-1",
            "llm_model": "gemini-1.5-flash-001",
            "stream": False,
            "generate_citations": False,
        }
    }
    if knowledge_ids:
        payload["config"]["knowledge_ids"] = knowledge_ids

    try:
        response = requests.post(DATAGRID_API_URL_CONVERSE, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        response_json = response.json()
        # Assuming the chatbot's reply is in a specific field, e.g., "reply" or "text"
        # Adjust this based on the actual API response structure
        return response_json.get("choices", [{}])[0].get("message", {}).get("content", "Sorry, I could not get a response.")
    except requests.exceptions.RequestException as e:
        return f"API Request Error: {e}"
    except json.JSONDecodeError:
        return "Error: Could not decode JSON response from the API."
    except IndexError:
        return "Error: Unexpected API response structure."

def upload_knowledge_from_file(filepath: str, api_key: str) -> str:
    """
    Uploads a file to Datagrid, creates knowledge from it, and returns the knowledge_id.
    """
    headers_file_upload = {
        "Authorization": f"Bearer {api_key}",
        # Content-Type is set by requests library for multipart/form-data
    }
    try:
        with open(filepath, 'rb') as f:
            files = {'file': (os.path.basename(filepath), f)}
            response_file = requests.post(DATAGRID_API_URL_FILES, headers=headers_file_upload, files=files)
            response_file.raise_for_status()
            file_id = response_file.json().get("id")

        if not file_id:
            return "Error: Could not get file_id from file upload response."

        headers_knowledge_create = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload_knowledge = {
            "file_ids": [file_id],
            "name": os.path.basename(filepath)
        }
        response_knowledge = requests.post(DATAGRID_API_URL_KNOWLEDGE, headers=headers_knowledge_create, json=payload_knowledge)
        response_knowledge.raise_for_status()
        knowledge_id = response_knowledge.json().get("id")

        if not knowledge_id:
            return "Error: Could not get knowledge_id from knowledge creation response."
        return knowledge_id

    except requests.exceptions.RequestException as e:
        return f"API Request Error: {e}"
    except FileNotFoundError:
        return f"Error: File not found at {filepath}"
    except json.JSONDecodeError:
        return "Error: Could not decode JSON response from the API."
    except Exception as e:
        return f"An unexpected error occurred: {e}"

def main_cli():
    """
    Runs the command-line interface for the chatbot.
    """
    api_key = os.getenv("DATAGRID_API_KEY")
    if not api_key:
        api_key = input("Enter your Datagrid API Key: ").strip()
        if not api_key:
            print("API Key is required to use the chatbot. Exiting.")
            return
        # Optionally, offer to save it to a .env file for future use
        save_env = input("Do you want to save this API key to a .env file for future sessions? (yes/no): ").lower()
        if save_env == 'yes':
            with open(".env", "a") as f: # Use "a" to append, "w" to overwrite
                if os.stat(".env").st_size != 0: # Check if file is not empty
                     f.write("\n")
                f.write(f"DATAGRID_API_KEY={api_key}\n")
            print("API Key saved to .env file.")

    print("\nAI Customer Support Chatbot")
    print("Type 'upload' to upload a knowledge file.")
    print("Type 'quit' to exit.")

    current_knowledge_id = None

    while True:
        user_input = input("\nYou: ").strip()

        if user_input.lower() == 'quit':
            print("Exiting chatbot. Goodbye!")
            break
        elif user_input.lower() == 'upload':
            filepath = input("Enter the path to your knowledge file (e.g., example_faq.txt): ").strip()
            if not os.path.exists(filepath):
                print(f"File not found: {filepath}")
                continue
            
            print(f"Uploading {filepath}...")
            knowledge_id_or_error = upload_knowledge_from_file(filepath, api_key)
            
            if "Error:" in knowledge_id_or_error:
                print(f"Knowledge upload failed: {knowledge_id_or_error}")
            else:
                current_knowledge_id = knowledge_id_or_error
                print(f"Knowledge file uploaded successfully. Knowledge ID: {current_knowledge_id}")
        else:
            if not api_key:
                print("API Key is not set. Please restart and enter your API key or set DATAGRID_API_KEY environment variable.")
                continue

            print("Chatbot is thinking...")
            knowledge_to_use = [current_knowledge_id] if current_knowledge_id else None
            response = ask_chatbot(user_input, api_key, knowledge_ids=knowledge_to_use)
            print(f"Chatbot: {response}")

if __name__ == "__main__":
    main_cli()
