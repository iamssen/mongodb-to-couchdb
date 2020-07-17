# Simple CouchDB testing helper for CouchDB cookie auth

```ts
import { signInCouchDBCookieAuth } from '@ssen/couchdb-testing-cookie-auth';

describe('your test', () => {
  let cookie: string;

  beforeAll(async () => {
    const cookie: string = await signInCouchDBCookieAuth({
      host: 'http://localhost:5984',
      username: 'admin',
      password: 'password',
    });
  });
 
  test('using cookie', async () => {
    const database = await fetch(`http://localhost:5984/test`, {
      method: 'GET',
      headers: {
        Cookie: cookie, // Using cookie
      },
    });
  });
})
```