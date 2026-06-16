import firebase_admin
from firebase_admin import auth, credentials
from pathlib import Path

cred_path = Path.home() / ".env" / "firebase-fitness.json"
cred = credentials.Certificate(str(cred_path))
firebase_admin.initialize_app(cred)

for user in auth.list_users().users:
    print(f"Email: {user.email}, UID: {user.uid}")
