## **Exemplos de Uso da API**

### **Criar Usuário**
```bash
curl -X POST "https://api-sessions-production.up.railway.app/api/v1/users" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "Saide Omar",
        "email": "saide.omar@example.com",
        "password": "Damasco12",
        "phoneNumber": "+258840123456"
    }'
```

---

### **Login**
```bash
curl -X POST "https://api-sessions-production.up.railway.app/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "saide.omar@example.com",
        "password": "Damasco12"
    }'
```

Resposta esperada:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "saide.omar@example.com",
      "username": "Saide Omar"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5c..."
  }
}
```

---

### **Criar Sessão**
```bash
curl -X POST "https://api-sessions-production.up.railway.app/api/v1/sessions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <TOKEN>" \
    -d '{
        "userId": 1,
        "title": "Gestor Lenister",
        "type": "regular"
    }'
```

---

### **Criar Fornecedor (Vendor)**
```bash
curl -X POST "https://api-sessions-production.up.railway.app/api/v1/vendors" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <TOKEN>" \
    -d '{
        "sessionId": "session_id_aqui",
        "phoneNumber": "+258850987654",
        "vendorName": "Fornecedor Teste"
    }'
```

---

### **Criar Vendedor (Seller)**
```bash
curl -X POST "https://api-sessions-production.up.railway.app/api/v1/sellers" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <TOKEN>" \
    -d '{
        "sessionId": "session_id_aqui",
        "sellerName": "Vendedor Teste",
        "product": "Produto Teste",
        "description": "Descrição do produto teste",
        "benefits": "Benefícios do produto teste",
        "image": null
    }'
```

---

### **Criar Mensagem**
```bash
curl -X POST "https://api-sessions-production.up.railway.app/api/v1/messages" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <TOKEN>" \
    -d '{
        "sessionId": "session_id_aqui",
        "sender": "Saide Omar",
        "content": "Mensagem de teste",
        "phoneNumber": "+258840123456"
    }'
```

---

### **Listar Recursos**
**Listar Sessões**
```bash
curl -X GET "https://api-sessions-production.up.railway.app/api/v1/sessions" \
    -H "Authorization: Bearer <TOKEN>"
```

**Listar Fornecedores**
```bash
curl -X GET "https://api-sessions-production.up.railway.app/api/v1/vendors" \
    -H "Authorization: Bearer <TOKEN>"
```

**Listar Vendedores**
```bash
curl -X GET "https://api-sessions-production.up.railway.app/api/v1/sellers" \
    -H "Authorization: Bearer <TOKEN>"
```

**Listar Mensagens**
```bash
curl -X GET "https://api-sessions-production.up.railway.app/api/v1/messages" \
    -H "Authorization: Bearer <TOKEN>"
```

---

### **Buscar Mensagens em Lote**
```bash
curl -X GET "https://api-sessions-production.up.railway.app/api/v1/messages/batch/session_id_aqui" \
    -H "Authorization: Bearer <TOKEN>"
```
