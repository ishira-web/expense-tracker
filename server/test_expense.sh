#!/bin/bash

# Setup
EMAIL_ADMIN="admin_$(date +%s)@example.com"
EMAIL_USER="user_$(date +%s)@example.com"
PASSWORD="password123"

echo "Setup: Registering Admin (simulated by manually setting role later if possible, but for now we rely on default user role and test basic flow)"
# Note: For this test to fully work with restricted routes, we'd need to create an Admin user properly.
# Since we can't easily set role via register, I will test the "User" flow primarily, and "Deposit" flow if I can mock generic token or if I modify code to allow non-hr deposit for testing (not safe).

# Instead, I'll register a user and test:
# 1. Deposit (I'll need to manually approve this or assuming the token has HR role. 
#    Actually, I can't easily become HR without DB access. 
#    Workaround: I'll use a user token for Deposit and expect a 403 Forbidden, verifying protection works.)

# 2. Create Expense (User flow) - Should succeed if I have balance? No, balance starts at 0.
#    If I create expense with 0 balance, it should track recoverAmount.

echo "1. Registering User"
USER_RESP=$(curl -s -X POST http://localhost:5000/api/users/register -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"$EMAIL_USER\",\"password\":\"$PASSWORD\"}")
echo "User Resp: $USER_RESP"

echo "2. Logging in"
LOGIN_JSON=$(curl -s -X POST http://localhost:5000/api/users/login -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL_USER\",\"password\":\"$PASSWORD\"}")
TOKEN=$(echo $LOGIN_JSON | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_JSON | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
echo "UserId: $USER_ID"

echo -e "\n3. Attempting Deposit as User (Should Fail 403)"
curl -s -X POST http://localhost:5000/api/expenses/deposit \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"userId\":\"$USER_ID\", \"amount\": 1000}"

echo -e "\n4. Creating Expense (Should succeed, balance becomes negative)"
# Note: File upload via curl is complex, skipping file for logic test (optional in model?)
# Model user says proofs is string, required? No, I made it optional in controller `proofs: file ? ...`
# Wait, model schema has `proofs: { type: String }` but not required explicitly (default required is false unless specified).
# Actually mongoose defaults are only applied if specified. `required: true` is missing so it's optional.

curl -s -X POST http://localhost:5000/api/expenses/create \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d "{
        \"date\": \"2024-01-01\",
        \"amount\": 500,
        \"description\": \"Lunch\",
        \"category\": \"Food\",
        \"paymentMethod\": \"Cash\"
     }"

echo -e "\n5. Checking History (Should show expense)"
curl -s -X GET http://localhost:5000/api/expenses \
     -H "Authorization: Bearer $TOKEN" 
