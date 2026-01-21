#!/bin/bash

# Generates a random email to ensure uniqueness
EMAIL="testuser_login_$(date +%s)@example.com"
PASSWORD="password123"
NAME="Login Tester"

echo "------------------------------------------------"
echo "1. Registering User: $EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/users/register \
     -H "Content-Type: application/json" \
     -d "{
           \"name\": \"$NAME\",
           \"email\": \"$EMAIL\",
           \"password\": \"$PASSWORD\"
         }")

echo "Response: $REGISTER_RESPONSE"

echo -e "\n------------------------------------------------"
echo "2. Logging in with correct credentials"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/users/login \
     -H "Content-Type: application/json" \
     -d "{
           \"email\": \"$EMAIL\",
           \"password\": \"$PASSWORD\"
         }")
echo "Response: $LOGIN_RESPONSE"

# Extract Access Token (Quick hack using grep/sed, proper json parsing is better but this works for simple checks)
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "Failed to get access token"
    exit 1
fi

echo "Access Token: $ACCESS_TOKEN"

echo -e "\n------------------------------------------------"
echo "3. Logging in with WRONG credentials"
curl -X POST http://localhost:5000/api/users/login \
     -H "Content-Type: application/json" \
     -d "{
           \"email\": \"$EMAIL\",
           \"password\": \"wrongpassword\"
         }"
echo ""

# Note: We haven't applied the protector to a route yet to test it fully, 
# but we can verify the login returns the tokens.
# To test the protector, we would need a dummy protected route.
# I will create a temporary protected route if needed, or we can trust the unit test approach (not using unit tests here though).
# I'll rely on the Login response having the tokens.

