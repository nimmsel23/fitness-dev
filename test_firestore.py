from firestore._db import get_db

db = get_db()
print("Listing documents in 'fitness' collection:")
docs = db.collection("fitness").list_documents()
for doc in docs:
    print(f"ID: {doc.id}")

print("\nStreaming documents in 'fitness' collection:")
docs = db.collection("fitness").stream()
for doc in docs:
    print(f"ID: {doc.id}")
