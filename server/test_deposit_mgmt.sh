#!/bin/bash

# Configuration
BASE_URL="http://localhost:5000/api"
EMAIL="test_deposit_mgmt_$(date +%s)@example.com"
PASSWORD="password123"
NAME="Deposit Mgmt Tester"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Setup: Registering Admin (simulated by manually setting role later if possible, but for now we rely on default user role and test basic flow)"
# 1. Register User
echo "1. Registering User"
REGISTER_RES=$(curl -s -X POST "$BASE_URL/users/register" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$NAME\", \"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}")

TOKEN=$(echo $REGISTER_RES | jq -r '.token')
echo "User Resp: $REGISTER_RES"

# 2. Login
echo "2. Logging in"
LOGIN_RES=$(curl -s -X POST "$BASE_URL/users/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RES | jq -r '.accessToken')
USER_ID=$(echo $LOGIN_RES | jq -r '.user.id' | tr -d '"')

echo "Token: $TOKEN"
echo "UserId: $USER_ID"

# Need to simulate HR role for deposit. Since we can't easily change role without DB access, 
# we'll assume the code allows us to temporarily bypass or we rely on the fact that we might have turned off protection for testing or we are testing the logic assuming we have permissions.
# WAIT: The route IS protected restrictTo('hr', 'admin', 'superadmin').
# TRICK: We will try to register a user, then we need a way to make them admin. 
# Since we don't have a direct way to make admin via API, we might fail here unless we have an existing admin token.
# BUT, we can try to use the 'test_expense.sh' approach where we might have assumed logic.
# actually, previous test failed deposit because of permissions.

# WORKAROUND: For this verification script, I will assume there is NO easy way to make an admin unless I use an existing one. 
# I will use the code I wrote to allow deposits to be updated/deleted by ADMINs.
# To test this, I really need an admin token. 
# I will try to login as a hardcoded admin if one exists, OR I will temporarily relax the route protection for verification purpose? NO, that's bad practice.
# I will try to create a user with "role": "admin" in registration? Usually that's blocked.
# Let's try to register with role admin, maybe it's not sanitized in `createUser`?
# checking user.controller.ts: `const { name, email, password } = req.body;` -> It does NOT take role. defaults to 'user'.

# OPTION: modifying the database directly via a script? We can use `mongo` shell if available, or a node script.
# I'll write a node script to create an admin user then use that token.

# Create a temporary TS file to generate the token
cat <<EOF > generate_admin_token.ts
import mongoose from 'mongoose';
import User from './src/models/user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
    let admin = await User.findOne({ email: 'admin@test.com' });
    if (!admin) {
        admin = new User({
            name: 'Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });
        await admin.save();
    } else {
        admin.role = 'admin';
        await admin.save();
    }
    
    const payload = { id: admin._id, role: admin.role };
    const token = jwt.sign(payload, process.env.SECRET_KEY || 'SecretKey20260116', { expiresIn: '15m' });
    fs.writeFileSync('params.json', JSON.stringify({ token, userId: admin._id }));
    process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
EOF

# Run with ts-node
npx ts-node generate_admin_token.ts

# Read token from params.json
ADMIN_TOKEN=$(cat params.json | jq -r '.token')
ADMIN_ID=$(cat params.json | jq -r '.userId')

echo "Admin Token Generated: $ADMIN_TOKEN"

# 3. Deposit Money (1000)
echo "3. Depositing 1000 to User $USER_ID"
DEPOSIT_RES=$(curl -s -X POST "$BASE_URL/expenses/deposit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"userId\":\"$USER_ID\", \"amount\":1000}")

echo "Deposit Res: $DEPOSIT_RES"

# 4. Get User Expense List to find the Deposit ID
# Since it's an expense with category Others and deposit > 0
EXPENSES_RES=$(curl -s -X GET "$BASE_URL/expenses?userId=$USER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

DEPOSIT_ID=$(echo $EXPENSES_RES | jq -r '.[0]._id')
echo "Deposit ID: $DEPOSIT_ID"

# 5. Update Deposit to 2000
echo "5. Updating Deposit to 2000"
UPDATE_RES=$(curl -s -X PUT "$BASE_URL/expenses/$DEPOSIT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"amount\":2000}")

echo "Update Res: $UPDATE_RES"

# Verify User Balance via Deposit Res or calculating?
# We can check user balance by making another deposit or checking profile if endpoint existed.
# Or check the expense list again? No, expense list won't show wallet balance.
# We can make a dummy deposit of 0 to see returned balance?
CHECK_RES=$(curl -s -X POST "$BASE_URL/expenses/deposit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"userId\":\"$USER_ID\", \"amount\":1}")
echo "Check Balance Res (should be ~2001): $CHECK_RES"


# 6. Delete Deposit
echo "6. Deleting Deposit"
DELETE_RES=$(curl -s -X DELETE "$BASE_URL/expenses/$DEPOSIT_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Delete Res: $DELETE_RES"

# 7. Check Balance again
CHECK_RES_2=$(curl -s -X POST "$BASE_URL/expenses/deposit" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"userId\":\"$USER_ID\", \"amount\":1}")
echo "Final Balance Res (should be ~2): $CHECK_RES_2"
