#!/bin/bash

API_BASE="https://api-sessions-production.up.railway.app/api/v1"
USER_EMAIL="saide.omar@example.com"
USER_PASSWORD="Damasco12"
USER_PHONE="+258840123456"
USER_NAME="Saide Omar"

# Criar o usuário
echo "Creating user..."
USER_RESPONSE=$(curl -s -X POST "$API_BASE/users" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USER_NAME\",
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\",
    \"phoneNumber\": \"$USER_PHONE\"
  }")

echo "User creation response:"
echo $USER_RESPONSE

# Verificar se o usuário foi criado ou se já existe
USER_EXISTS=$(echo $USER_RESPONSE | grep -o '"status":"error","message":"User already exists"')

if [ -n "$USER_EXISTS" ]; then
  echo "User already exists. Proceeding with login."
else
  USER_ID=$(echo $USER_RESPONSE | grep -o '"id":[^,]*' | cut -d':' -f2)

  if [ -z "$USER_ID" ]; then
    echo "Failed to create user"
    echo "Response: $USER_RESPONSE"
    exit 1
  fi

  echo "User created successfully with ID: $USER_ID"
fi

# Logar o usuário
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\"
  }")

# Extrair o token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "Token received: ${TOKEN:0:20}..."

# Criar a sessão
echo "Creating session..."
SESSION_RESPONSE=$(curl -s -X POST "$API_BASE/sessions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"userId\": $USER_ID,
    \"title\": \"Gestor Lenister\",
    \"type\": \"regular\",
    \"status\": \"active\"
  }")

echo "Session creation response:"
echo $SESSION_RESPONSE
