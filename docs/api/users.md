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