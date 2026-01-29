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
    "participantId": "507f191e810c19729de860ea" 
}

```
Response:
```json
Status: 201 SUCCESS
{
    "conversationId": "507f1f77bcf86cd799439012",
    "conversation": {
        "_id": "507f1f77bcf86cd799439012",
        "participantIds": [
            {
                "_id": "507f1f77bcf86cd799439011",
                "name": "Current User"
            },
            {
                "_id": "507f191e810c19729de860ea", 
                "name": "Other User"
            }
        ]
    }
}
Status: 400 BAD REQUEST
{
    "error": "participantId required"
}
Status: 403 FORBIDDEN
{
    "error": "Cannot create conversation: User 507f191e810c19729de860ea has blocked you"
}
{
    "error": "Cannot create conversation: You have blocked user 507f191e810c19729de860ea"
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

