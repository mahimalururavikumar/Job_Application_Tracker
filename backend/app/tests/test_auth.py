def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "testuser@example.com",
            "password": "secretpassword123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testuser@example.com"
    assert data["user"]["full_name"] == "Test User"

def test_register_duplicate_email(client):
    user_payload = {
        "email": "dup@example.com",
        "password": "password123",
        "full_name": "Duplicate User"
    }
    # First registration
    client.post("/api/auth/register", json=user_payload)
    # Second registration with same email
    res = client.post("/api/auth/register", json=user_payload)
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]

def test_login_user(client):
    user_payload = {
        "email": "login@example.com",
        "password": "correctpassword",
        "full_name": "Login User"
    }
    client.post("/api/auth/register", json=user_payload)

    # Success login
    login_res = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "correctpassword"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None

    # Failed login
    fail_res = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "wrongpassword"}
    )
    assert fail_res.status_code == 401

def test_get_current_user(client):
    user_payload = {
        "email": "me@example.com",
        "password": "password123",
        "full_name": "Me User"
    }
    reg_res = client.post("/api/auth/register", json=user_payload)
    token = reg_res.json()["access_token"]

    # Valid token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "me@example.com"

    # Invalid token
    bad_res = client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken"})
    assert bad_res.status_code == 401
