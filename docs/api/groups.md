# /groups
- wird in Datenbank wie folgt erwartet
```js
groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  adminIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],
  lastMessageAt: { type: Date, index: true },
  lastMessageText: { type: String },
  lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
```
## POST /groups
Request:
```
POST .../groups
Content-Type: application/json

{
  "name": "Projekt Alpha",
  "adminIds": ["605c1f2e9b1e8b3a5c9d4f2a"],
  "memberIds": ["605c1f2e9b1e8b3a5c9d4f2b"]
}
```
Response:
```json
Status: 201 CREATED
{
  "_id": "60bc1f9e7b2e8b4b2e9d1a3c",
  "name": "Projekt Alpha",
  "adminIds": ["605c1f2e9b1e8b3a5c9d4f2a"],
  "memberIds": ["605c1f2e9b1e8b3a5c9d4f2b"],
  "createdAt": "...",
  "updatedAt": "..."
}

Status: 400 ERROR
{ "error": "Group must have at least one admin" }
```
## GET /groups
Request:
```
GET .../groups
```
Response:
```json
Status: 200 OK
[
  {
    "_id": "60bc1f9e7b2e8b4b2e9d1a3c",
    "name": "Projekt Alpha",
    "adminIds": [...],
    "memberIds": [...],
    "lastMessageText": "Hey Team!"
  }
]

Status: 500 ERROR
{ "error": "<Fehlernachricht>" }

``` 
## PATCH /groups/:groupID
Request:
```
PATCH .../groups/60bc1f9e7b2e8b4b2e9d1a3c
Content-Type: application/json

{ "name": "Gruppenname" }
```
Response:
```json
Status: 200 OK
{
  "_id": "60bc1f9e7b2e8b4b2e9d1a3c",
  "name": "Gruppenname",
  "adminIds": [...],
  "memberIds": [...]
}

Status: 404 NOT FOUND
{ "error": "Group not found" }
``` 
## DELETE /groups/:groupID
Request:
```
DELETE .../groups/60bc1f9e7b2e8b4b2e9d1a3c
```
Response:
```json
Status: 204 No Content

Status: 404 NOT FOUND
{ "error": "Group not found" }
``` 
## POST /groups/:groupID/members
Request:
```
POST .../groups/60bc1f9e7b2e8b4b2e9d1a3c/members
Content-Type: application/json

{ "userId": "605c1f2e9b1e8b3a5c9d4f2b" }
```
Response:
```json
Status: 200 OK
{
  "_id": "60bc1f9e7b2e8b4b2e9d1a3c",
  "memberIds": ["605c1f2e9b1e8b3a5c9d4f2b", "..."]
}

Status: 400 ERROR
{ "error": "userId required" }

Status: 404 NOT FOUND
{ "error": "Group not found" }
``` 
## GET /groups/:groupID/members
Request:
```
GET .../groups/60bc1f9e7b2e8b4b2e9d1a3c/members
```
Response:
```json
Status: 200 OK
{
  "members": [{ "_id": "...", "name": "User A" }],
  "admins": [{ "_id": "...", "name": "User B" }]
}

Status: 404 NOT FOUND
{ "error": "Group not found" }
``` 
## DELETE /groups/:groupID/members
Request:
```
DELETE .../groups/60bc1f9e7b2e8b4b2e9d1a3c/members
Content-Type: application/json

{ "userId": "605c1f2e9b1e8b3a5c9d4f2b" }
```
Response:
```json
Status: 204 No Content

Status: 400 ERROR
{ "error": "Group must have at least one admin" }

Status: 404 NOT FOUND
{ "error": "Group not found" }
``` 
## GET /groups/:groupID/roles
Request:
```
GET .../groups/60bc1f9e7b2e8b4b2e9d1a3c/roles
```
Response:
```json
Status: 200 OK
{
  "groupId": "...",
  "roles": [
    { "userId": "...", "role": "admin" },
    { "userId": "...", "role": "member" }
  ]
}

Status: 404 NOT FOUND
{ "error": "Group not found" }
``` 
## PATCH /groups/:groupID/members/:userID/role
Request:
```
PATCH .../groups/:groupID/members/:userID/role
Content-Type: application/json

{ "role": "admin" }
```
Response:
```json
Status: 200 OK
{ "_id": "...", "adminIds": [...], "memberIds": [...] }

Status: 400 ERROR
{ "error": "Invalid role" }

Status: 404 NOT FOUND
{ "error": "Group not found" }
``` 
## Messages
- werden in Datenbank wie folgt erwartet:
```js
messageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  attachments: [{ url: String, type: String }]
}, { timestamps: true });
```

### POST /groups/:groupID/messages
Request:
```
POST .../groups/60bc1f9e7b2e8b4b2e9d1a3c/messages
Content-Type: application/json

{ "senderId": "605c1f2e9b1e8b3a5c9d4f2b", "text": "Hallo Gruppe" }
```
Response:
```json
Status: 201 CREATED
{
  "_id": "...",
  "groupId": "...",
  "senderId": "...",
  "text": "Hallo Gruppe",
  "createdAt": "..."
}

Status: 404 NOT FOUND
{ "error": "Group not found" }
``` 
### GET /groups/:groupID/messages
Request:
```
GET .../groups/:groupID/messages
```
Response:
```json
Status: 200 OK
[
  { "_id": "...", "senderId": "...", "text": "Hallo", "createdAt": "..." }
]
``` 
### DELETE /groups/:groupID/messages
Request:
```
DELETE .../groups/:groupID/messages
```
Response:
```json
Status: 204 No Content
``` 
### DELETE /groups/:groupID/messages/:messageID
Request:
```
DELETE .../groups/:groupID/messages/:messageID
```
Response:
```json
Status: 204 No Content

Status: 404 NOT FOUND
{ "error": "Message not found" }
``` 
## Announcements
- werden in Datenbank wie folgt erwartet:
```js
announcementSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", index: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  text: { type: String, required: true }
}, { timestamps: true });
```
### POST /groups/:groupID/announcements
Request:
```
POST .../groups/:groupID/announcements
Content-Type: application/json

{ "creatorId": "...", "title": "Meeting", "text": "Morgen um 10 Uhr" }
```
Response:
```json
Status: 201 CREATED
{
  "_id": "...",
  "groupId": "...",
  "creatorId": "...",
  "title": "Meeting",
  "text": "Morgen um 10 Uhr"
}

Status: 404 NOT FOUND
{ "error": "Group not found" }
``` 
### GET /groups/:groupID/announcements
Request:
```
GET .../groups/:groupID/announcements
```
Response:
```json
Status: 200 OK
[
  { "_id": "...", "title": "Meeting", "text": "Morgen um 10 Uhr" }
]
``` 
### PATCH /groups/:groupID/announcements/:announcementID
Request:
```
PATCH .../groups/:groupID/announcements/:announcementID
Content-Type: application/json

{ "title": "Neuer Termin", "text": "Montag um 11 Uhr" }
```
Response:
```json
Status: 200 OK
{
  "_id": "...",
  "title": "Neuer Termin",
  "text": "Montag um 11 Uhr"
}

Status: 404 NOT FOUND
{ "error": "Announcement not found" }
``` 
### DELETE /groups/:groupID/announcements/:announcementID
Request:
```
DELETE .../groups/:groupID/announcements/:announcementID
```
Response:
```json
Status: 204 No Content

Status: 404 NOT FOUND
{ "error": "Announcement not found" }
```