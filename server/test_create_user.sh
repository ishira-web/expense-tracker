#!/bin/bash

# Generates a random email to ensure uniqueness
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="password123"
NAME="Test User"

echo "Testing Create User with:"
echo "Email: $EMAIL"
echo "Name: $NAME"

curl -X POST http://localhost:5000/api/users/register \
     -H "Content-Type: application/json" \
     -d "{
           \"name\": \"$NAME\",
           \"email\": \"$EMAIL\",
           \"password\": \"$PASSWORD\"
         }"

echo -e "\n"
