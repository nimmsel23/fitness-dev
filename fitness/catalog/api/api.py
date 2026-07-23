"""
Compatibility shim for the refactored modular FastAPI backend.
All actual routes and server logic have been migrated to the 'fitness.api' package.
This file remains to ensure compatibility with existing systemd services and scripts.
"""
from fitness.api.main import app, main

if __name__ == "__main__":
    main()
