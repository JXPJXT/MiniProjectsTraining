import asyncio
from typing import List, Dict, Any, Optional
from bson import ObjectId

class MockResult:
    def __init__(self, inserted_id=None):
        self.inserted_id = inserted_id

class MockCursor:
    def __init__(self, data):
        self.data = data
        self.idx = 0

    def sort(self, key, direction):
        # Sort in place. direction: 1 for asc, -1 for desc
        reverse = (direction == -1)
        # Handle None values safely if needed, assuming numeric/comparable keys
        self.data.sort(key=lambda x: x.get(key, 0), reverse=reverse)
        return self

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.idx < len(self.data):
            val = self.data[self.idx]
            self.idx += 1
            return val
        else:
            raise StopAsyncIteration

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = {} # Map _id (ObjectId) to document (dict)

    async def find_one(self, filter: Dict[str, Any]):
        for doc in self.data.values():
            if self._matches(doc, filter):
                return doc.copy()
        return None

    def find(self, filter: Dict[str, Any]):
        results = []
        for doc in self.data.values():
            if self._matches(doc, filter):
                results.append(doc.copy())
        return MockCursor(results)

    async def insert_one(self, document: Dict[str, Any]):
        if "_id" not in document:
            document["_id"] = ObjectId()
        self.data[document["_id"]] = document
        return MockResult(inserted_id=document["_id"])

    async def delete_one(self, filter: Dict[str, Any]):
        to_delete = None
        for doc_id, doc in self.data.items():
             if self._matches(doc, filter):
                 to_delete = doc_id
                 break
        if to_delete:
            del self.data[to_delete]
        return MockResult()

    async def delete_many(self, filter: Dict[str, Any]):
        to_delete = []
        for doc_id, doc in self.data.items():
            if self._matches(doc, filter):
                 to_delete.append(doc_id)
        for doc_id in to_delete:
            del self.data[doc_id]
        return MockResult()

    async def update_one(self, filter: Dict[str, Any], update: Dict[str, Any]):
        doc_id_to_update = None
        current_doc = None
        
        # Find document
        for doc_id, doc in self.data.items():
            if self._matches(doc, filter):
                doc_id_to_update = doc_id
                current_doc = doc
                break
        
        if current_doc:
            if "$set" in update:
                for k, v in update["$set"].items():
                    current_doc[k] = v
            self.data[doc_id_to_update] = current_doc
            
        return MockResult()

    def _matches(self, doc, filter):
        for k, v in filter.items():
            if k == "$or":
                # v is a list of dicts. If any matches, return True
                if not any(self._matches(doc, sub_filter) for sub_filter in v):
                    return False
                continue

            # Handle direct value check
            doc_val = doc.get(k)

            # Special operator handling
            if isinstance(v, dict):
                if "$all" in v:
                    # Check if all items in v["$all"] are in doc_val (which should be a list)
                    if not isinstance(doc_val, list):
                        return False
                    for item in v["$all"]:
                        if item not in doc_val:
                            return False
                    # Continue to next key in filter (don't return True yet)
                elif "$size" in v:
                    if not isinstance(doc_val, list) or len(doc_val) != v["$size"]:
                        return False
                else:
                    # deeply nested query or other operators not implemented?
                    # For now assume direct equality if it's not a known operator
                    # But actually in Mongo { field: {subfield: val} } matches exact object.
                    # We might need to handle specific operators if app uses them.
                    # The app uses: {"participants": {"$all": p, "$size": 2}} - handled above.
                    pass
            else:
                # Direct equality or array containment
                if isinstance(doc_val, list) and not isinstance(v, list):
                    # Mongo behavior: if field is array, and query value is scalar, match if scalar in array
                    if v not in doc_val:
                        return False
                else:
                    if doc_val != v:
                        return False
        return True

class MockAdmin:
    async def command(self, cmd):
        if cmd == 'ping':
            return {"ok": 1}
        return {}

class MockClient:
    def __init__(self):
        self.admin = MockAdmin()
        self.db = {}

    def get_collection(self, name):
        if name not in self.db:
            self.db[name] = MockCollection(name)
        return self.db[name]
