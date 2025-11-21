import requests
import json

BASE = "http://127.0.0.1:8000"

# Test connect
r = requests.get(f"{BASE}/connect")
print("CONNECT:", r)
print("DATA:", r.json())

# Test generate
payload = {"prompt": "generate a histogram of the 'duration' column"}
r = requests.post(f"{BASE}/generate", json=payload)
print("GENERATE:", r)
print("DATA:", r.json())