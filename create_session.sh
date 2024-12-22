#!/bin/bash

# Configurações da API
API_BASE="https://api-sessions-production.up.railway.app/api/v1"
USER_EMAIL="saide.omar@example.com"
USER_PASSWORD="Damasco12"
USER_PHONE="+258840123456"
USER_NAME="Saide Omar"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens com cor
print_message() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Função para verificar resposta da API
check_response() {
    if [[ $1 =~ '"status":"success"' ]]; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
        echo "Response: $1"
        exit 1
    fi
}

# 1. Criar usuário
print_message "Creating user"
USER_RESPONSE=$(curl -s -X POST "$API_BASE/users" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$USER_NAME\",
        \"email\": \"$USER_EMAIL\",
        \"password\": \"$USER_PASSWORD\",
        \"phoneNumber\": \"$USER_PHONE\"
    }")

# Verificar se usuário já existe ou foi criado
USER_EXISTS=$(echo $USER_RESPONSE | grep -o '"status":"error","message":"User already exists"')
if [ -n "$USER_EXISTS" ]; then
    echo "Note: User already exists"
else
    check_response "$USER_RESPONSE"
fi

# 2. Login
print_message "Logging in"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$USER_EMAIL\",
        \"password\": \"$USER_PASSWORD\"
    }")

# Extrair token e user ID
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$TOKEN" ] || [ -z "$USER_ID" ]; then
    echo -e "${RED}Failed to get token or user ID${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "Token received: ${TOKEN:0:20}..."
echo "User ID: $USER_ID"

# 3. Criar sessão
print_message "Creating session"
SESSION_RESPONSE=$(curl -s -X POST "$API_BASE/sessions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"userId\": $USER_ID,
        \"title\": \"Gestor Lenister\",
        \"type\": \"regular\"
    }")

# Extrair session ID
SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
if [ -z "$SESSION_ID" ]; then
    echo -e "${RED}Failed to get session ID${NC}"
    echo "Response: $SESSION_RESPONSE"
    exit 1
fi
echo "Session ID: $SESSION_ID"

# 4. Criar fornecedor (vendor)
print_message "Creating vendor"
VENDOR_RESPONSE=$(curl -s -X POST "$API_BASE/vendors" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"sessionId\": \"$SESSION_ID\",
        \"phoneNumber\": \"+258850987654\",
        \"vendorName\": \"Fornecedor Teste\"
    }")
check_response "$VENDOR_RESPONSE"

# 5. Criar vendedor (seller)
print_message "Creating seller"
SELLER_RESPONSE=$(curl -s -X POST "$API_BASE/sellers" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"sessionId\": \"$SESSION_ID\",
        \"sellerName\": \"Vendedor Teste\",
        \"product\": \"Produto Teste\",
        \"description\": \"Descrição do produto teste\",
        \"benefits\": \"Benefícios do produto teste\",
        \"image\": null
    }")
check_response "$SELLER_RESPONSE"

# 6. Criar mensagem
print_message "Creating message"
MESSAGE_RESPONSE=$(curl -s -X POST "$API_BASE/messages" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"sessionId\": \"$SESSION_ID\",
        \"sender\": \"$USER_NAME\",
        \"content\": \"Mensagem de teste\",
        \"phoneNumber\": \"$USER_PHONE\"
    }")
check_response "$MESSAGE_RESPONSE"

# 7. Listar todos os recursos
print_message "Listing all resources"

echo "Getting sessions..."
curl -s -X GET "$API_BASE/sessions" \
    -H "Authorization: Bearer $TOKEN"

echo -e "\nGetting vendors..."
curl -s -X GET "$API_BASE/vendors" \
    -H "Authorization: Bearer $TOKEN"

echo -e "\nGetting sellers..."
curl -s -X GET "$API_BASE/sellers" \
    -H "Authorization: Bearer $TOKEN"

echo -e "\nGetting messages..."
curl -s -X GET "$API_BASE/messages" \
    -H "Authorization: Bearer $TOKEN"

# 8. Buscar mensagens em lote
print_message "Getting batch messages"
curl -s -X GET "$API_BASE/messages/batch/$SESSION_ID" \
    -H "Authorization: Bearer $TOKEN"

print_message "All tests completed successfully!"