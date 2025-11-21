import json
import random
from datetime import datetime, timedelta

def create_json_lines_file(n, filename="api_logs.json"):
    """
    Creates a JSON file with n lines of API log data
    
    Parameters:
    n (int): Number of lines/JSON objects to create
    filename (str): Output filename
    """
    vendors = ["vendor_A", "vendor_B", "vendor_C", "vendor_D", "vendor_E", "vendor_F", "vendor_G"]
    user_agents = [
        "VendorA-API-Client/1.0", 
        "VendorB-Service/2.1", 
        "VendorC-Processor/3.0",
        "VendorD-Mobile/1.2",
        "VendorE-Web/2.0"
    ]
    methods = ["GET", "POST"]
    endpoints = ["/api/v1/offers/", "/api/v1/offers/batch"]
    
    data = []
    base_time = datetime(2024, 1, 15, 8, 0, 0)
    
    for i in range(n):
        # Generate random data
        vendor = random.choice(vendors)
        method = random.choice(methods)
        
        if method == "POST":
            endpoint = "/api/v1/offers/batch"
            offer_ids = [f"offer_{random.randint(700, 900)}" for _ in range(random.randint(2, 4))]
            offer_field = {"offer_ids": offer_ids}
        else:
            endpoint = f"/api/v1/offers/offer_{random.randint(100, 500)}"
            offer_field = {"offer_id": endpoint.split("/")[-1]}
        
        # Create log entry
        log_entry = {
            "timestamp": (base_time + timedelta(minutes=i*2, seconds=random.randint(0, 59))).isoformat() + "Z",
            "method": method,
            "endpoint": endpoint,
            "vendor_id": vendor,
            "customer_id": f"cust_{i+1:03d}",
            "status_code": random.choice([200, 200, 200, 200, 404, 403, 500]),  # 200 is more common
            "response_time_ms": random.randint(20, 100),
            "headers": {
                "User-Agent": random.choice(user_agents),
                "Content-Type": "application/json",
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
                "X-Request-ID": f"req_{i+1:03d}",
                "X-Vendor-Key": f"key_{vendor[-1]}{random.randint(100, 999)}"
            }
        }
        
        # Add offer field
        log_entry.update(offer_field)
        data.append(log_entry)
    
    # Write to file (JSON Lines format)
    with open(filename, 'w') as f:
        for entry in data:
            f.write(json.dumps(entry) + '\n')
    
    print(f"Created {filename} with {n} lines of JSON data")
    return filename

# Example usage
create_json_lines_file(100, "sample_logs.json")