# /auth
## POST /auth/register
Request:
``` json
Body: 
{
	"name": "Max Mustermann", 
	"email": "max@example.com", 
	"password": "securePassword123" 
}
```
Response:
```json
Status: 201 CREATED 
{ 
	"message": "User created successfully", 
	"user": { 
		"_id": "507f1f77bcf86cd799439011", 
		"name": "Max Mustermann", 
		"email": "max@example.com", 
		"createdAt": "2026-01-21T13:00:00.000Z" 
	} 
} 
Status: 400 BAD REQUEST 
{ 
	"error": "All fields are required" 
} 
Status: 400 BAD REQUEST 
{ 
	"error": "Email already exists" 
} 
Status: 500 SERVER ERROR 
{ 
	"error": "Server error" 
}
```
## POST /auth/login
Request:
```json
Body: 
{ 
	"email": "max@example.com", 
	"password": "securePassword123" 
}
```
Response:
```json
Status: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Max Mustermann",
    "email": "max@example.com"
  }
}
Status: 400 BAD REQUEST
{
  "error": "Email and password required"
}
Status: 401 UNAUTHORIZED
{
  "error": "Invalid credentials"
}
Status: 500 SERVER ERROR
{
  "error": "Server error"
}
```
## DELETE /auth/account
Request:
```json
Headers: 
{ 
	"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
}
```
Response:
```json
Status: 200 OK
{
  "message": "deleted successfully"
}
Status: 401 UNAUTHORIZED
{
  "error": "Session token required"
}
Status: 401 UNAUTHORIZED
{
  "error": "Invalid or expired token"
}
Status: 404 NOT FOUND
{
  "message": "user doesn't exist"
}
Status: 500 SERVER ERROR
{
  "error": "Server error"
}
``` 