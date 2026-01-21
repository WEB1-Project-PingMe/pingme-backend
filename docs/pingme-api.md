
- der token und die userID müssen in das localstorage gespeichert werden
- der token ist aktuell für 7 Tage gültig
- Passwörter werden verschlüsselt gespeichert
- Alle Endpunkte außer /test, /auth/register und /auth/login benötigen den sessionToken im header
```json
Headers: 
{ 
	"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
}
```
Beispiel Implementierung:
``` JS
const token = localStorage.getItem("sessionToken");
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(BACKEND_URL + url, {
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        });

        ....
        
    } catch ......
``` 

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
# /users
- wird in Datenbank wie folgt erwartert
```json
userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	password: { type: String, required: true},
	email: { type: String, required: true, unique: true },
}, { timestamps: true });
```
## GET /users/:userID
Request:
``` http
GET .../users/605c1f2e9b1e8b3a5c9d4f2a
```
Response:
``` json
Status: 200 OK
{  
	"name": "Max Mustermann",  
	"email": "[max@example.com](mailto:max@example.com)"  
}

Status: 404 NOT FOUND
{  
	"error": "User not found"  
}

Status: 500 ERROR
{  
	"error": "<Fehlernachricht>"  
}
```
## PATCH /users - nicht implementiert
```

```
## PATCH /users/status - nicht implementiert
```

```
## GET /users/setting - nicht implementiert
```

```
## PATCH /users/settings - nicht implementiert
```

```

# /conversations
in Datenbank:
```JS
const conversationSchema = new Schema(
{
	participantIds: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
	lastMessageAt: { type: Date, index: true },
	lastMessageText: { type: String },
	// type: { type: String, enum: ["direct", "group"], default: "direct" },
	leftUsers: [{ userId: { type: Schema.Types.ObjectId, ref: "User" }, leftAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

const messageSchema = new Schema(
{
	conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", index: true },
	groupId: { type: Schema.Types.ObjectId, ref: "Group", index: true },
	senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	text: { type: String, required: true },
	attachments: [
	{
		url: String,
		type: String,
	},],
	deletedAt: { type: Date, default: null },
	editedAt: { type: Date, default: null },
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });
```
## GET /conversations
Request:
``` http
GET /conversations
```
Response:
``` json
{ 
	"success": true, 
	"conversations": [ { 
		"_id": "507f1f77bcf86cd799439012", 
		// "type": "direct", 
		"participants": [ { 
			"_id": "507f191e810c19729de860ea", -> enthält nur die ID des anderen Nutzers, nicht die des aktuell eingeloggten
			"email": "anna@example.com" 
		} ], 
		"lastMessageAt": "2026-01-21T11:30:00.000Z", 
		"lastMessageText": "Hallo! Wie geht's?", 
		"updatedAt": "2026-01-21T11:30:00.000Z", 
		"createdAt": "2026-01-21T10:00:00.000Z" 
	} ] 
}
```
## POST /conversations
Request:
``` json
Body:
{ 
	"participantIds": ["507f1f77bcf86cd799439011", "507f191e810c19729de860ea"] 
}
```
Response:
```json
Status: 201 SUCCESS
{
	"message": "Conversation created successfully",
	"conversationId": "507f1f77bcf86cd799439012"
}
Status: 400 BAD REQUEST
{
	"error": "participantIds array with 2 users required"
}
```
## DELETE /conversations - nicht implementiert
```
Ein nutzer kann den Chat verlassen, keine neuen Nachrichten möglich bis neu eintritt
Vorschlag, neuer Eintrag bei conversations, dokumentiert ob ein Nutzer den Chat verlassen hat 
	-> keiner kann neue Nachrichten in diesen Chat senden
	-> beide können ehemalige Nachrichten noch betrachten

leftUsers: [{ 
	userId: { type: Schema.Types.ObjectId, ref: "User" }, 
	leftAt: { type: Date, default: Date.now } 
}],

```
## GET /conversations/messages
Request:
``` http
GET /conversations/messages?conversationId=507f1f77bcf86cd799439012&limit=20&before=2026-01-21T12:00:00.000Z
```
Reponse:
``` json
Status: 200 OK
{ 
	"messages": [ { 
		"_id": "507f1f77bcf86cd799439013", 
		"conversationId": "507f1f77bcf86cd799439012", 
		"senderId": "507f191e810c19729de860ea", 
		"text": "Hallo zurück!", 
		"attachments": [], 
		"createdAt": "2026-01-21T11:30:05.000Z", 
		"updatedAt": "2026-01-21T11:30:05.000Z" 
	} ] 
}
Status: 400 ERROR
{ 
	"error": "conversationId is required" 
}
```
## POST /conversations/messages
Request:
```json
Body:
{ 
	"conversationId": "507f1f77bcf86cd799439012", 
	"senderId": "507f1f77bcf86cd799439011", 
	"text": "Hallo! Wie geht's?" 
}
```
Response:
```json
Status: 201 SUCCESS
{
  "message": {
    "_id": "507f1f77bcf86cd799439013",
    "conversationId": "507f1f77bcf86cd799439012",
    "senderId": "507f1f77bcf86cd799439011",
    "text": "Hallo! Wie geht's?",
    "attachments": [],
    "deletedAt": null,
    "editedAt": null,
    "createdAt": "2026-01-21T11:30:00.000Z",
    "updatedAt": "2026-01-21T11:30:00.000Z"
  }
}
Status: 400 ERROR
{ 
	"error": "conversationId, senderId, text required" 
}
```
## DELETE /conversations/messages
Request:
```json
Body:
{
	"conversationId" : "507f1f77bcf86cd799439012", 
	"messageId": "507f1f77bcf86cd799439013"
}
```
Response:
```json
{
	"success": true,
	"message": "Message deleted successfully"
}
```
# /groups - nicht implementiert