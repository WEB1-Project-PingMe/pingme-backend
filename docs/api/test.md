# \test
- einfacher Funktionscheck der API, gibt den aktuell authentifizierten Benutzer (req.user) zurück, sofern vorhanden
## GET /
Request:
```
GET .../
``` 
Response:
```json
Status: 200 OK
{
  "message": "Test API working! currentUserID",
  "currentUser": {
    "_id": "605c1f2e9b1e8b3a5c9d4f2a",
    "name": "tester"
  },
  "timestamp": "2026-01-22T14:05:00.000Z",
  "status": "success"
}
```