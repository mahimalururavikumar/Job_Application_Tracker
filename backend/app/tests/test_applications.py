def get_auth_headers(client, email="appuser@example.com"):
    res = client.post(
        "/api/auth/register",
        json={"email": email, "password": "password123", "full_name": "App User"}
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_crud_applications(client):
    headers = get_auth_headers(client)

    # 1. Create application
    app_payload = {
        "company": "Google",
        "role": "Software Engineer",
        "link": "https://careers.google.com/jobs/123",
        "status": "Applied",
        "date_applied": "2026-10-01",
        "follow_up_date": "2026-10-15",
        "notes": "Referral submitted by Alex",
        "location": "Mountain View, CA",
        "salary": "$150,000"
    }
    create_res = client.post("/api/applications", json=app_payload, headers=headers)
    assert create_res.status_code == 201
    created_app = create_res.json()
    app_id = created_app["id"]
    assert created_app["company"] == "Google"
    assert created_app["status"] == "Applied"

    # 2. Get applications list
    list_res = client.get("/api/applications", headers=headers)
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] == 1
    assert list_data["items"][0]["id"] == app_id

    # 3. Search & Filter
    search_res = client.get("/api/applications?search=Google", headers=headers)
    assert search_res.json()["total"] == 1

    no_match_res = client.get("/api/applications?search=NonExistentCompany", headers=headers)
    assert no_match_res.json()["total"] == 0

    # 4. Update application status to Interview
    update_res = client.put(
        f"/api/applications/{app_id}",
        json={"status": "Interview", "notes": "Passed initial recruiter screen!"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Interview"
    assert "recruiter screen" in update_res.json()["notes"]

    # 5. Delete application
    del_res = client.delete(f"/api/applications/{app_id}", headers=headers)
    assert del_res.status_code == 204

    # Verify deletion
    get_res = client.get(f"/api/applications/{app_id}", headers=headers)
    assert get_res.status_code == 404

def test_user_data_isolation(client):
    headers_user1 = get_auth_headers(client, email="user1@example.com")
    headers_user2 = get_auth_headers(client, email="user2@example.com")

    # User 1 creates an application
    create_res = client.post(
        "/api/applications",
        json={
            "company": "User1 Company",
            "role": "Backend Developer",
            "status": "Applied",
            "date_applied": "2026-10-02"
        },
        headers=headers_user1
    )
    app_id = create_res.json()["id"]

    # User 2 lists applications -> should be empty
    list_user2 = client.get("/api/applications", headers=headers_user2)
    assert list_user2.json()["total"] == 0

    # User 2 tries to fetch User 1's app -> should 404
    get_user2 = client.get(f"/api/applications/{app_id}", headers=headers_user2)
    assert get_user2.status_code == 404

    # User 2 tries to update User 1's app -> should 404
    update_user2 = client.put(
        f"/api/applications/{app_id}",
        json={"status": "Rejected"},
        headers=headers_user2
    )
    assert update_user2.status_code == 404

def test_analytics_endpoint(client):
    headers = get_auth_headers(client, email="analytics@example.com")

    # Create 2 applications: 1 Applied, 1 Interview
    client.post(
        "/api/applications",
        json={"company": "Comp A", "role": "Dev", "status": "Applied", "date_applied": "2026-10-01"},
        headers=headers
    )
    client.post(
        "/api/applications",
        json={"company": "Comp B", "role": "Dev", "status": "Interview", "date_applied": "2026-10-02"},
        headers=headers
    )

    analytics_res = client.get("/api/analytics", headers=headers)
    assert analytics_res.status_code == 200
    data = analytics_res.json()
    assert data["total_applications"] == 2
    assert data["status_counts"]["Applied"] == 1
    assert data["status_counts"]["Interview"] == 1
    assert data["response_rate"] == 50.0 # 1 out of 2 responses (Interview)
