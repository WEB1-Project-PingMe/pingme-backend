
# Grundlagen

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
# Endpunkte

- [/auth](./auth.md)
- [/blocks](./blocks.md)
- [/contacts](./contacts.md)
- [/conversations](./conversations.md)
- [/groups](./groups.md)
- [/test](./test.md)
- [/users](./users.md)



