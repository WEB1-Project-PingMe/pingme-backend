# \contacts
in Datenbank:
```js
const contactSchema = new Schema({
  username: { type: String, required: true, trim: true },
  contactName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  contactUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }
}, { timestamps: true });
```

***

## POST \contacts
Request:
```json
Body:
{
  "username": "janedoe",
  "contactName": "Jane Doe",
  "email": "jane@example.com",
  "contactUserId": "507f1f77bcf86cd799439022"
}
```
Response:
```json
Status: 201 CREATED
{
  "_id": "609b8e1a2f50a91234abcd02",
  "username": "janedoe",
  "contactName": "Jane Doe",
  "email": "jane@example.com",
  "contactUserId": {
    "_id": "507f1f77bcf86cd799439022",
    "userId": "janedoe"
  },
  "createdBy": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "currentUser"
  },
  "createdAt": "2026-01-29T16:00:00.000Z",
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```
Error:
```json
Status: 400 BAD REQUEST
{ "error": "email and username are required" }
```

***

## GET \contacts
Request:
```http
GET /contacts?createdBy=507f1f77bcf86cd799439012
```
Response:
```json
Status: 200 OK
[
  {
    "_id": "609b8e1a2f50a91234abcd01",
    "username": "johndoe",
    "contactName": "John Doe",
    "email": "john@example.com",
    "contactUserId": {
      "_id": "507f1f77bcf86cd799439022",
      "name": "John"
    },
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "CurrentUser"
    },
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-26T12:30:00.000Z"
  }
]
```
Error:
```json
Status: 500 ERROR
{ "error": "Database connection failed" }
```

***

## GET \contacts\:contactID
Request:
```http
GET /contacts/609b8e1a2f50a91234abcd02
```
Response:
```json
Status: 200 OK
{
  "_id": "609b8e1a2f50a91234abcd02",
  "username": "janedoe",
  "contactName": "Jane Doe",
  "email": "jane@example.com",
  "contactUserId": {
    "_id": "507f1f77bcf86cd799439022",
    "userId": "janedoe"
  },
  "createdBy": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "currentUser"
  },
  "createdAt": "2026-01-29T16:00:00.000Z",
  "updatedAt": "2026-01-29T16:00:00.000Z"
}
```
Errors:
```json
Status: 404 NOT FOUND
{ "error": "Contact not found" }

Status: 403 FORBIDDEN
{ "error": "Access denied" }
```

***


## PATCH \contacts\:contactID
Request:
```json
Body:
{
  "contactName": "Jane D.",
  "email": "jane.d@example.com"
}
```
Response:
```json
Status: 200 OK
{
  "_id": "609b8e1a2f50a91234abcd02",
  "username": "janedoe",
  "contactName": "Jane D.",
  "email": "jane.d@example.com",
  "contactUserId": {
    "_id": "507f1f77bcf86cd799439022",
    "userId": "janedoe",
    "email": "jane.d@example.com"
  },
  "createdBy": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "currentUser"
  },
  "updatedAt": "2026-01-29T17:00:00.000Z"
}
```
Errors:
```json
Status: 404 NOT FOUND
{ "error": "Contact not found" }

Status: 403 FORBIDDEN
{ "error": "Access denied" }
```

***

## DELETE \contacts\:contactID
Request:
```http
DELETE /contacts/609b8e1a2f50a91234abcd02
```
Response:
```json
Status: 200 OK
{ "message": "Contact deleted successfully" }
```
Errors:
```json
Status: 404 NOT FOUND
{ "error": "Contact not found" }

Status: 403 FORBIDDEN
{ "error": "Access denied" }

Status: 500 ERROR
{ "error": "Server error" }
```