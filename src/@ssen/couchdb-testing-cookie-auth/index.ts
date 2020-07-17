import { Fail, Session, SessionParameters } from '@ssen/couchdb';
import fetch from 'node-fetch';

interface Params {
  host: string;
  username: string;
  password: string;
}

export async function signInCouchDBCookieAuth({ host, username, password }: Params): Promise<string> {
  const res = await fetch(`${host}/_session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: username,
      password,
    } as SessionParameters),
  });

  if (res.status !== 200) {
    const detail: Fail = await res.json();
    throw new Error(`signin to couchdb failed with ${res.status}, "${JSON.stringify(detail)}"`);
  }

  const { ok }: Session = await res.json();

  if (ok && res.headers.has('set-cookie')) {
    return res.headers
      .get('set-cookie')!
      .split(',')
      .map((item) => item.split(';')[0])
      .join(';');
  } else {
    console.error(res);
    throw new Error(`signin to couchdb failed. see more in console.error()`);
  }
}
