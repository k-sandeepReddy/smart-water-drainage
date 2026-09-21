import sys
import os

# Add backend dir to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
from priority import calculate_priority

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Ramaswami Peta" in data["location"]
    print("[PASS] Health check passed.")

def test_priority_engine():
    # Test High priority triggers
    assert calculate_priority("Water Supply", "Severe Shortage", "No water for 5 days") == "High"
    assert calculate_priority("Drainage", "Blocked Major Drain", "Flooding street") == "High"
    assert calculate_priority("Stagnant Water", "Puddle", "Near home with mosquito dengue risk") == "High"
    
    # Test Medium priority triggers
    assert calculate_priority("Garbage", "Accumulation", "Bin overflowing on street") == "Medium"
    assert calculate_priority("Water Supply", "Low pressure", "Irregular timing") == "Medium"
    
    # Test Low priority triggers
    assert calculate_priority("Other", "General suggestion", "Please install awareness banner") == "Low"
    print("[PASS] Rule-Based Priority Engine verified.")

def test_auth():
    # Resident login
    res = client.post("/auth/login", json={"username_or_email": "resident", "password": "resident123"})
    assert res.status_code == 200, res.text
    resident_token = res.json()["access_token"]
    assert res.json()["user"]["role"] == "resident"

    # Admin login
    res = client.post("/auth/login", json={"username_or_email": "admin", "password": "admin123"})
    assert res.status_code == 200, res.text
    admin_token = res.json()["access_token"]
    assert res.json()["user"]["role"] == "admin"

    # Invalid login
    res = client.post("/auth/login", json={"username_or_email": "resident", "password": "wrongpassword"})
    assert res.status_code == 401
    print("[PASS] Authentication & Role checks passed.")
    return resident_token, admin_token

def test_survey_analytics():
    res = client.get("/survey/analytics")
    assert res.status_code == 200
    data = res.json()
    assert data["total_responses"] == 208, f"Expected 208, got {data['total_responses']}"
    assert data["q1_regular_water"]["Yes"] == 122
    assert data["q2_summer_shortage"]["Yes"] == 129
    assert data["q7_stagnant_water"]["Yes"] == 116
    assert data["q12_suggestion"]["Improve Pipe Network"] == 65
    print("[PASS] Survey Analytics 208 Ground Truth verified.")

def test_complaint_workflow(resident_token, admin_token):
    res_headers = {"Authorization": f"Bearer {resident_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Resident reports a problem
    new_comp = {
        "category": "Drainage",
        "problem_type": "Blocked Drain",
        "location": "Near Ramaswami Temple, Ramaswami Peta",
        "description": "Severely blocked drain causing major overflow and foul smell near homes",
        "latitude": 17.0855,
        "longitude": 81.8942
    }
    res = client.post("/complaints", json=new_comp, headers=res_headers)
    assert res.status_code == 201, res.text
    created = res.json()
    cid = created["id"]
    assert created["status"] == "Pending"
    assert created["priority"] == "High"
    print(f"[PASS] Resident created complaint: {cid} (Priority: {created['priority']})")

    # 2. Resident checks My Complaints
    res = client.get("/complaints?my_only=true", headers=res_headers)
    assert res.status_code == 200
    my_cids = [c["id"] for c in res.json()]
    assert cid in my_cids
    print("[PASS] Complaint appears in Resident's My Complaints.")

    # 3. Admin manages complaint -> Assigned
    res = client.put(
        f"/complaints/{cid}/status",
        json={"status": "Assigned", "assigned_to": "Ward 3 Sanitation Crew", "comment": "Assigned to Ward 3 team"},
        headers=admin_headers
    )
    assert res.status_code == 200
    assert res.json()["status"] == "Assigned"

    # 4. Admin updates -> In Progress
    res = client.put(
        f"/complaints/{cid}/status",
        json={"status": "In Progress", "comment": "Crew began desilting the drain"},
        headers=admin_headers
    )
    assert res.status_code == 200
    assert res.json()["status"] == "In Progress"

    # 5. Admin updates -> Resolved
    res = client.put(
        f"/complaints/{cid}/status",
        json={"status": "Resolved", "comment": "Drain fully cleared, wastewater flowing smoothly"},
        headers=admin_headers
    )
    assert res.status_code == 200
    assert res.json()["status"] == "Resolved"
    assert len(res.json()["updates"]) >= 4
    print("[PASS] Full Admin status transition Pending -> Assigned -> In Progress -> Resolved verified.")

    # 6. Resident sees notifications
    res = client.get("/notifications", headers=res_headers)
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) > 0
    print(f"[PASS] Resident has {len(notifs)} notifications.")

def test_reports_and_export(admin_token):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/reports/summary", headers=admin_headers)
    assert res.status_code == 200
    assert "total_complaints" in res.json()
    
    csv_res = client.get("/reports/export-csv", headers=admin_headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Complaint ID,Category,Problem Type" in csv_res.text
    print("[PASS] Admin Reports summary & CSV Export verified.")

if __name__ == "__main__":
    print("Running Smart Water & Drainage Backend Tests...")
    test_health()
    test_priority_engine()
    res_tok, adm_tok = test_auth()
    test_survey_analytics()
    test_complaint_workflow(res_tok, adm_tok)
    test_reports_and_export(adm_tok)
    print("ALL BACKEND TESTS PASSED SUCCESSFULLY!")
