# Documentação da API

## URL Base

```
http://localhost:8080/api/v1
```

---

## Autenticação

A maioria dos endpoints requer autenticação via token Bearer no cabeçalho de autorização:

```
Authorization: Bearer <token>
```

---

## Endpoints

### Usuários

#### **Criar Usuário**

**POST** `/users`

**Descrição:** Registra um novo usuário.

**Body**:

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string"
}
```

**Resposta (201):**

```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "phoneNumber": "string",
  "createdAt": "string"
}
```

---

#### **Obter Perfil do Usuário**

**GET** `/users/me`

**Descrição:** Retorna o perfil do usuário atual.

**Autenticação:** Obrigatória.

**Resposta (200):**

```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "phoneNumber": "string",
  "createdAt": "string"
}
```

---

### Sessões

#### **Criar Sessão**

**POST** `/sessions`

**Descrição:** Cria uma nova sessão.

**Autenticação:** Obrigatória.

**Resposta (201):**

```json
{
  "id": "number",
  "sessionId": "string",
  "userId": "number",
  "createdAt": "string"
}
```

---

#### **Obter Detalhes da Sessão**

**GET** `/sessions/:sessionId`

**Descrição:** Retorna os detalhes de uma sessão.

**Autenticação:** Obrigatória.

**Parâmetros:**

- `sessionId`: Identificador da sessão.

**Resposta (200):**

```json
{
  "id": "number",
  "sessionId": "string",
  "userId": "number",
  "createdAt": "string",
  "messages": [],
  "vendors": [],
  "sellers": []
}
```

---

### Mensagens

#### **Enviar Mensagem**

**POST** `/messages`

**Descrição:** Envia uma nova mensagem em uma sessão.

**Autenticação:** Obrigatória.

**Body**:

```json
{
  "sessionId": "string",
  "content": "string",
  "sender": "string",
  "phoneNumber": "string",
  "mediaUrl": "string (opcional)"
}
```

**Resposta (201):**

```json
{
  "id": "number",
  "sessionId": "string",
  "content": "string",
  "sender": "string",
  "phoneNumber": "string",
  "mediaUrl": "string",
  "createdAt": "string"
}
```

---

#### **Obter Mensagens da Sessão**

**GET** `/messages/:sessionId`

**Descrição:** Retorna todas as mensagens de uma sessão.

**Autenticação:** Obrigatória.

**Parâmetros:**

- `sessionId`: Identificador da sessão.

**Resposta (200):**

```json
{
  "messages": [
    {
      "id": "number",
      "sessionId": "string",
      "content": "string",
      "sender": "string",
      "phoneNumber": "string",
      "mediaUrl": "string",
      "createdAt": "string"
    }
  ]
}
```

---

### Fornecedores

#### **Registrar Fornecedor**

**POST** `/vendors`

**Descrição:** Registra um novo fornecedor.

**Autenticação:** Obrigatória.

**Body**:

```json
{
  "sessionId": "string",
  "phoneNumber": "string",
  "vendorName": "string"
}
```

**Resposta (201):**

```json
{
  "id": "number",
  "sessionId": "string",
  "phoneNumber": "string",
  "vendorName": "string",
  "createdAt": "string"
}
```

---

#### **Obter Detalhes do Fornecedor**

**GET** `/vendors/:sessionId`

**Descrição:** Retorna os detalhes de um fornecedor associado a uma sessão.

**Autenticação:** Obrigatória.

**Parâmetros:**

- `sessionId`: Identificador da sessão.

**Resposta (200):**

```json
{
  "id": "number",
  "sessionId": "string",
  "phoneNumber": "string",
  "vendorName": "string",
  "createdAt": "string"
}
```

---

### Vendedores

#### **Criar Vendedor**

**POST** `/sellers`

**Descrição:** Registra um novo vendedor com um produto.

**Autenticação:** Obrigatória.

**Body**:

```json
{
  "sessionId": "string",
  "sellerName": "string",
  "product": "string",
  "description": "string",
  "image": "string (opcional)",
  "benefits": "string"
}
```

**Resposta (201):**

```json
{
  "id": "number",
  "sessionId": "string",
  "sellerName": "string",
  "product": "string",
  "description": "string",
  "image": "string",
  "benefits": "string",
  "createdAt": "string"
}
```

---

#### **Obter Vendedores da Sessão**

**GET** `/sellers/:sessionId`

**Descrição:** Retorna todos os vendedores em uma sessão.

**Autenticação:** Obrigatória.

**Parâmetros:**

- `sessionId`: Identificador da sessão.

**Resposta (200):**

```json
{
  "sellers": [
    {
      "id": "number",
      "sessionId": "string",
      "sellerName": "string",
      "product": "string",
      "description": "string",
      "image": "string",
      "benefits": "string",
      "createdAt": "string"
    }
  ]
}
```

---

### Respostas de Erro

| Código | Mensagem                       |
|--------|--------------------------------|
| 400    | Requisição Inválida            |
| 401    | Não Autorizado                 |
| 403    | Proibido                       |
| 404    | Não Encontrado                 |
| 429    | Muitas Requisições             |
| 500    | Erro Interno no Servidor       |

**Exemplo de resposta de erro:**

```json
{
  "status": "error",
  "message": "Mensagem descritiva do erro"
}
```