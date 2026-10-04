import os
import sys

# Ensure backend directory is in the import path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "..", "enterprise-ai-helpdesk", "backend")

if os.path.exists(backend_dir) and backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the FastAPI application
from app.main import app

# Vercel serverless entrypoint
handler = app
