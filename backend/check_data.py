import requests
BASE = "http://localhost:8000/api"
r = requests.post(f"{BASE}/auth/login", json={"email":"admin@example.com","password":"admin123"})
t = r.json()["access_token"]
h = {"Authorization": f"Bearer {t}"}

stats = requests.get(f"{BASE}/admin/stats", headers=h).json()
print("=== ADMIN STATS ===")
for k, v in stats.items():
    print(f"  {k}: {v}")

projs = requests.get(f"{BASE}/admin/projects", headers=h).json()
print(f"\n=== PROJECTS ({len(projs)}) ===")
for p in projs:
    print(f"  {p['name']} | Status: {p['status']} | Employees: {len(p['assigned_employees'])}")

svcs = requests.get(f"{BASE}/admin/services", headers=h).json()
print(f"\n=== SERVICES ({len(svcs)}) ===")
for s in svcs:
    print(f"  {s['name']}")

reqs = requests.get(f"{BASE}/admin/service-requests", headers=h).json()
print(f"\n=== SERVICE REQUESTS ({len(reqs)}) ===")
for req in reqs:
    print(f"  {req['client_name']} → {req['service_name']} | Status: {req['status']}")
