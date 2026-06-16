import sys
import firebase_admin
from firebase_admin import auth, credentials
from pathlib import Path

cred_path = Path.home() / ".env" / "firebase-fitness.json"
cred = credentials.Certificate(str(cred_path))
firebase_admin.initialize_app(cred)

uid = sys.argv[1]
try:
    auth.set_custom_user_claims(uid, {'coach': True})
    print(f"Success! Set 'coach' claim for UID: {uid}")
except Exception as e:
    print(f"Error: {e}")
