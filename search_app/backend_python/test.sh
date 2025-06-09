#!/bin/bash
# Script to run Python unit tests for the backend

# Navigate to the directory containing the tests
# This script assumes it's being run from the search_app/backend_python directory
# or that the paths are adjusted accordingly if run from elsewhere.

echo "Running Python backend unit tests..."

# Set PYTHONPATH to include the 'search_app' directory if 'backend_python.main' is used for import
# This allows 'from backend_python import main' to work if tests are run from project root
# Or, if tests are inside backend_python and use 'from .. import main'
# we need to be in a directory above search_app or ensure search_app is in PYTHONPATH.

# Assuming the script is in search_app/backend_python:
# Option 1: Run from the backend_python directory, assuming 'from .. import main'
# cd "$(dirname "$0")"
# python -m unittest discover tests

# Option 2: Run from project root (/app), ensuring search_app is discoverable
# This is more robust if the test runner is invoked from the project root.
# To make 'from backend_python import main' work, 'search_app' must be in PYTHONPATH.
# The tests file uses 'from .. import main' which implies the tests directory itself is a package,
# and it's looking for 'main' in its parent package ('backend_python').

# Let's try to make it runnable from the /app directory (project root)
# by being in the backend_python directory for test discovery.
cd search_app/backend_python
python -m unittest discover tests

# Or, to run a specific file if discover isn't working as expected due to path issues:
# python -m unittest tests.test_main

echo "Python tests finished."
# Exit with the status of the test command
exit $?
