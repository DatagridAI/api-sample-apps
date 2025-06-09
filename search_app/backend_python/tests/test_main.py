import unittest
from unittest.mock import patch, MagicMock
import os
import io

# Ensure the app can be imported. Assuming main.py is in the parent directory.
# This might need adjustment based on how the execution environment handles paths.
# For local testing, one might add the parent dir to sys.path or use a different import strategy.
try:
    from backend_python import main # If tests are run from outside search_app directory
except ImportError:
    from .. import main # If tests are run as a module from within search_app directory or similar


class TestApp(unittest.TestCase):

    def setUp(self):
        main.app.testing = True
        self.client = main.app.test_client()
        # Store original DATAGRID_API_KEY and clear it for most tests
        self.original_api_key = os.environ.get("DATAGRID_API_KEY")
        if "DATAGRID_API_KEY" in os.environ:
            del os.environ["DATAGRID_API_KEY"]

    def tearDown(self):
        # Restore original DATAGRID_API_KEY
        if self.original_api_key is not None:
            os.environ["DATAGRID_API_KEY"] = self.original_api_key
        elif "DATAGRID_API_KEY" in os.environ:
            # if it was not set originally but got set by a test
            del os.environ["DATAGRID_API_KEY"]
        main.DATAGRID_API_KEY = os.environ.get("DATAGRID_API_KEY") # Reset in main module

    def _set_api_key(self):
        os.environ["DATAGRID_API_KEY"] = "test_api_key"
        main.DATAGRID_API_KEY = "test_api_key" # Ensure the global in main is updated

    # --- Test /upload ---
    def test_upload_missing_api_key(self):
        response = self.client.post('/upload', data={'file': (io.BytesIO(b"test content"), 'test.csv')})
        self.assertEqual(response.status_code, 500)
        self.assertIn("DATAGRID_API_KEY not configured", response.json['error'])

    @patch('requests.post')
    def test_upload_success(self, mock_post):
        self._set_api_key()

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"message": "File uploaded successfully"}
        mock_post.return_value = mock_response

        file_content = b"dummy file content"
        file_name = "test.csv"
        data = {
            'file': (io.BytesIO(file_content), file_name)
        }

        response = self.client.post('/upload', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"message": "File uploaded successfully"})

        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        self.assertEqual(args[0], f"{main.DATAGRID_API_URL}/files")
        self.assertIn("Authorization", kwargs["headers"])
        self.assertEqual(kwargs["headers"]["Authorization"], f"Bearer test_api_key")
        self.assertIn("file", kwargs["files"])
        uploaded_file_tuple = kwargs["files"]["file"]
        self.assertEqual(uploaded_file_tuple[0], file_name)
        # uploaded_file_tuple[1] is the file stream, check its content
        self.assertEqual(uploaded_file_tuple[1].read(), file_content)


    @patch('requests.post')
    def test_upload_api_error(self, mock_post):
        self._set_api_key()

        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.json.return_value = {"error": "Datagrid internal error"}
        # Simulate raise_for_status() behavior for a 500 error
        mock_response.raise_for_status = MagicMock(side_effect=requests.exceptions.HTTPError("API Error"))
        mock_post.return_value = mock_response

        data = {'file': (io.BytesIO(b"some data"), 'test.txt')}
        response = self.client.post('/upload', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 500)
        self.assertIn("error", response.json)
        # The actual error message comes from requests.exceptions.HTTPError.__str__
        self.assertTrue("API Error" in response.json['error'])


    # --- Test /search ---
    def test_search_missing_api_key(self):
        response = self.client.get('/search?query=test')
        self.assertEqual(response.status_code, 500)
        self.assertIn("DATAGRID_API_KEY not configured", response.json['error'])

    @patch('requests.get')
    def test_search_success(self, mock_get):
        self._set_api_key()

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"results": ["item1", "item2"]}
        mock_get.return_value = mock_response

        query = "test_query"
        response = self.client.get(f'/search?query={query}')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"results": ["item1", "item2"]})

        mock_get.assert_called_once_with(
            f"{main.DATAGRID_API_URL}/search",
            headers={"Authorization": f"Bearer test_api_key"},
            params={"query": query}
        )

    @patch('requests.get')
    def test_search_api_error(self, mock_get):
        self._set_api_key()

        mock_response = MagicMock()
        mock_response.status_code = 404 # Example: query not found or bad query
        mock_response.json.return_value = {"error": "Not found on Datagrid"}
        mock_response.raise_for_status = MagicMock(side_effect=requests.exceptions.HTTPError("API Client Error"))
        mock_get.return_value = mock_response

        response = self.client.get('/search?query=nonexistent')

        self.assertEqual(response.status_code, 500) # Our handler converts it to 500 if not handled more specifically
        self.assertIn("error", response.json)
        self.assertTrue("API Client Error" in response.json['error'])

    def test_search_missing_query_param(self):
        self._set_api_key()
        response = self.client.get('/search')
        self.assertEqual(response.status_code, 400)
        self.assertIn("Query parameter is missing", response.json['error'])


if __name__ == '__main__':
    # This is to allow running the tests directly,
    # but usually, you'd use 'python -m unittest discover'
    # Adjust sys.path if necessary when running directly vs. with discover
    # For example, if backend_python is not in PYTHONPATH:
    # import sys
    # sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
    # from backend_python import main # re-import with path adjusted if needed
    unittest.main()

# Need to import requests for requests.exceptions.HTTPError
import requests
