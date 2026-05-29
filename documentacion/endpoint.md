# Endpoints Homiwood

## Auth

### Register

```http
POST /api/auth/register
```

Requiere token: No

Body:

```json
{
  "nombre": "Javier Godoy",
  "username": "javier",
  "email": "javier@email.com",
  "password": "123456"
}
```

Respuesta:

```json
{
  "token": "...",
  "tokenType": "Bearer",
  "usuario": {
    "idUsuario": 1,
    "nombre": "Javier Godoy",
    "username": "javier",
    "email": "javier@email.com"
  }
}
```