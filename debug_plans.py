from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
import sys

# Mock serialize_doc from server.py
def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == "_id":
                result["id"] = str(value)
            elif isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = [serialize_doc(item) for item in value]
            else:
                result[key] = value
        return result
    return doc

try:
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "mlm_vsv_unite")
    client = MongoClient(MONGO_URL)
    db = client[MONGO_DB_NAME]
    plans_collection = db["plans"]

    print("Fetching plans...")
    plans = list(plans_collection.find({"isActive": True}))
    print(f"Found {len(plans)} plans.")
    
    print("Serializing...")
    serialized = serialize_doc(plans)
    print("Serialization success!")
    print(serialized)

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
