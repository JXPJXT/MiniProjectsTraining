from mock_database import MockClient

# Offline Mode: Use MockClient instead of Motor
client = MockClient()
db = client.db

user_collection = client.get_collection("users")
conversation_collection = client.get_collection("conversations")
message_collection = client.get_collection("messages")
