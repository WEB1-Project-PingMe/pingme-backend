# \blocks
in Datenbank:
```js
const BlockSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, 
  },
  {
    timestamps: true,
  }
);

```

***

## POST /blocks
Request:
```json
Body:
{
  "blockedUserId": "507f191e810c19729de860ea"
}
```

Response:
```json
Status: 201 CREATED
{
  "message": "user blocked",
  "block": {
    "_id": "65b91f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "blockedUserId": "507f191e810c19729de860ea",
    "createdAt": "2026-01-29T18:42:00.000Z",
    "updatedAt": "2026-01-29T18:42:00.000Z"
  }
}
```

```json
Status: 200 OK
{
  "message": "user is already blocked"
}
```

```json
Status: 400 BAD REQUEST
{
  "message": "blockedUserId ist required"
}
```

```json
Status: 500 INTERNAL SERVER ERROR
{
  "message": "internal server error"
}
```

***

## GET /blocks
Request:
```http
GET /blocks
```

Response:
```json
Status: 200 OK
{
  "blockedUsers": [
    {
      "_id": "65b91f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "blockedUserId": {
        "_id": "507f191e810c19729de860ea",
        "username": "anna"
      },
      "createdAt": "2026-01-29T18:42:00.000Z",
      "updatedAt": "2026-01-29T18:42:00.000Z"
    }
  ]
}
```

```json
Status: 500 INTERNAL SERVER ERROR
{
  "message": "internal server error"
}
```

***

## DELETE /blocks/:blockedUserId
Request:
```http
DELETE /blocks/507f191e810c19729de860ea
```

Response:
```json
Status: 204 NO CONTENT
```

```json
Status: 404 NOT FOUND
{
  "message": "block not found"
}
```

```json
Status: 500 INTERNAL SERVER ERROR
{
  "message": "internal server error"
}
```

***