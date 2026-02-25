"""
Demo Setup Script - Creates full workflow data:
1. Login as Admin
2. Create Services
3. Create an Employee
4. Login as Client (abhi@gmail.com) and request a service
5. Login as Admin, approve the request
6. Assign employee to the project
"""
import requests

BASE = "http://localhost:8000/api"

def login(email, password):
    r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
    r.raise_for_status()
    data = r.json()
    print(f"  ✅ Logged in as {data['name']} ({data['role']})")
    return data["access_token"], data["user_id"]

def auth_header(token):
    return {"Authorization": f"Bearer {token}"}

# ── Step 1: Login as Admin ──
print("\n🔐 Step 1: Logging in as Admin...")
admin_token, admin_id = login("admin@example.com", "admin123")

# ── Step 2: Create Services ──
print("\n🛠  Step 2: Creating Services...")
services_to_create = [
    {"name": "Web Development", "description": "Full-stack web application development using modern frameworks like React, Angular, and Node.js"},
    {"name": "Mobile App Development", "description": "Native and cross-platform mobile app development for iOS and Android"},
    {"name": "UI/UX Design", "description": "Modern, user-centered design with wireframing, prototyping, and usability testing"},
    {"name": "Cloud & DevOps", "description": "Cloud infrastructure setup, CI/CD pipelines, and deployment automation"},
]

created_services = []
for svc in services_to_create:
    try:
        r = requests.post(f"{BASE}/admin/services", json=svc, headers=auth_header(admin_token))
        r.raise_for_status()
        created_services.append(r.json())
        print(f"  ✅ Created service: {svc['name']}")
    except Exception as e:
        print(f"  ⚠️  Service '{svc['name']}' may already exist: {e}")

# ── Step 3: Create an Employee ──
print("\n👷 Step 3: Creating Employee user...")
employee_data = {"name": "Ravi Kumar", "email": "ravi@gmail.com", "password": "ravi123", "role": "EMPLOYEE"}
try:
    r = requests.post(f"{BASE}/admin/users", json=employee_data, headers=auth_header(admin_token))
    r.raise_for_status()
    employee_id = r.json().get("user_id") or r.json().get("id")
    print(f"  ✅ Created employee: Ravi Kumar (ravi@gmail.com / ravi123)")
except Exception as e:
    print(f"  ⚠️  Employee may already exist, fetching...")
    r = requests.get(f"{BASE}/admin/users/employees", headers=auth_header(admin_token))
    employees = r.json()
    employee_id = None
    for emp in employees:
        if emp["email"] == "ravi@gmail.com":
            employee_id = emp["id"]
            break
    if not employee_id and employees:
        employee_id = employees[0]["id"]
    print(f"  ✅ Using employee ID: {employee_id}")

# ── Step 4: Login as Client and request a service ──
print("\n🏢 Step 4: Logging in as Client (abhi@gmail.com)...")
try:
    client_token, client_id = login("abhi@gmail.com", "abhi123")
    
    # Get available services
    r = requests.get(f"{BASE}/client/services", headers=auth_header(client_token))
    services = r.json()
    
    if services:
        print("\n📋 Step 4b: Requesting services as Client...")
        # Request the first service
        svc = services[0]
        try:
            r = requests.post(f"{BASE}/client/service-requests", 
                json={"service_id": svc["id"], "message": f"I need a professional {svc['name']} solution for my business"},
                headers=auth_header(client_token))
            r.raise_for_status()
            print(f"  ✅ Requested service: {svc['name']}")
        except Exception as e:
            print(f"  ⚠️  Request may already exist: {e}")
        
        # Request a second service if available
        if len(services) > 1:
            svc2 = services[1]
            try:
                r = requests.post(f"{BASE}/client/service-requests",
                    json={"service_id": svc2["id"], "message": f"We need {svc2['name']} for our startup project"},
                    headers=auth_header(client_token))
                r.raise_for_status()
                print(f"  ✅ Requested service: {svc2['name']}")
            except Exception as e:
                print(f"  ⚠️  Request may already exist: {e}")
    else:
        print("  ⚠️  No services found to request")

except Exception as e:
    print(f"  ❌ Client login failed: {e}")

# ── Step 5: Login as Admin and approve requests ──
print("\n🔐 Step 5: Logging in as Admin to approve requests...")
admin_token, _ = login("admin@example.com", "admin123")

r = requests.get(f"{BASE}/admin/service-requests", headers=auth_header(admin_token))
requests_list = r.json()
pending = [req for req in requests_list if req["status"] == "PENDING"]
print(f"  📋 Found {len(pending)} pending requests")

for req in pending:
    try:
        r = requests.put(f"{BASE}/admin/service-requests/{req['id']}/approve", headers=auth_header(admin_token))
        r.raise_for_status()
        print(f"  ✅ Approved request from {req['client_name']} for {req['service_name']}")
    except Exception as e:
        print(f"  ⚠️  Approval failed: {e}")

# ── Step 6: Assign employee to projects ──
print("\n📁 Step 6: Assigning employee to projects...")
r = requests.get(f"{BASE}/admin/projects", headers=auth_header(admin_token))
projects = r.json()

if employee_id:
    for proj in projects:
        if employee_id not in proj.get("assigned_employees", []):
            try:
                current = proj.get("assigned_employees", [])
                r = requests.put(f"{BASE}/admin/projects/{proj['id']}/assign",
                    json={"employee_ids": current + [employee_id]},
                    headers=auth_header(admin_token))
                r.raise_for_status()
                print(f"  ✅ Assigned Ravi Kumar to project: {proj['name']}")
            except Exception as e:
                print(f"  ⚠️  Assignment failed: {e}")
        else:
            print(f"  ✅ Ravi Kumar already assigned to: {proj['name']}")

# ── Step 7: Send some messages ──
print("\n💬 Step 7: Sending demo messages...")
try:
    # Admin sends message to client
    r = requests.post(f"{BASE}/messages/", 
        json={"receiver_id": client_id, "content": "Welcome to Narendra Tech Solutions! Your project has been approved and we have assigned our best developer to it."},
        headers=auth_header(admin_token))
    r.raise_for_status()
    print("  ✅ Admin → Client: Welcome message sent")
except Exception as e:
    print(f"  ⚠️  Message failed: {e}")

try:
    # Admin sends message to employee
    if employee_id:
        r = requests.post(f"{BASE}/messages/",
            json={"receiver_id": employee_id, "content": "Hi Ravi, you have been assigned a new project. Please start working on it and update the status."},
            headers=auth_header(admin_token))
        r.raise_for_status()
        print("  ✅ Admin → Employee: Task assignment message sent")
except Exception as e:
    print(f"  ⚠️  Message failed: {e}")

# ── Step 8: Employee updates project status ──
print("\n🚀 Step 8: Employee updating project status...")
try:
    emp_token, _ = login("ravi@gmail.com", "ravi123")
    r = requests.get(f"{BASE}/employee/projects", headers=auth_header(emp_token))
    emp_projects = r.json()
    if emp_projects:
        proj = emp_projects[0]
        r = requests.put(f"{BASE}/employee/projects/{proj['id']}/status",
            json={"status": "IN_PROGRESS"},
            headers=auth_header(emp_token))
        r.raise_for_status()
        print(f"  ✅ Project '{proj['name']}' status → IN_PROGRESS")
except Exception as e:
    print(f"  ⚠️  Status update failed: {e}")

# ── Summary ──
print("\n" + "=" * 55)
print("  🎉 DEMO SETUP COMPLETE!")
print("=" * 55)
print("\n  Login Credentials:")
print("  ┌─────────────┬──────────────────────┬───────────┐")
print("  │ Role        │ Email                │ Password  │")
print("  ├─────────────┼──────────────────────┼───────────┤")
print("  │ Admin       │ admin@example.com    │ admin123  │")
print("  │ Employee    │ ravi@gmail.com       │ ravi123   │")
print("  │ Client      │ abhi@gmail.com       │ abhi123   │")
print("  └─────────────┴──────────────────────┴───────────┘")
print("\n  Frontend: http://localhost:5173")
print()
