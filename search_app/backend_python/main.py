import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

DATAGRID_API_KEY = os.environ.get("DATAGRID_API_KEY")
DATAGRID_API_URL = "https://api.datagrid.com/v1"

@app.route("/upload", methods=["POST"])
def upload_file():
    if not DATAGRID_API_KEY:
        return jsonify({"error": "DATAGRID_API_KEY not configured"}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        # Save the file temporarily (optional, could also stream to the API)
        # For simplicity, we're not saving it in this example and will send it directly.

        headers = {
            "Authorization": f"Bearer {DATAGRID_API_KEY}"
        }
        files = {
            'file': (file.filename, file.stream, file.mimetype)
        }

        try:
            response = requests.post(f"{DATAGRID_API_URL}/files", headers=headers, files=files)
            response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)
            return jsonify(response.json()), response.status_code
        except requests.exceptions.RequestException as e:
            app.logger.error(f"Error uploading to Datagrid API: {e}")
            return jsonify({"error": str(e)}), 500

@app.route("/search", methods=["GET"])
def search_files():
    if not DATAGRID_API_KEY:
        return jsonify({"error": "DATAGRID_API_KEY not configured"}), 500

    query = request.args.get("query")
    if not query:
        return jsonify({"error": "Query parameter is missing"}), 400

    headers = {
        "Authorization": f"Bearer {DATAGRID_API_KEY}"
    }

    try:
        response = requests.get(f"{DATAGRID_API_URL}/search", headers=headers, params={"query": query})
        response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)
        return jsonify(response.json()), response.status_code
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Error searching with Datagrid API: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
