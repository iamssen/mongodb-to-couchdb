import { View } from '@ssen/couchdb';
import { signInCouchDBCookieAuth } from '@ssen/couchdb-testing-cookie-auth';
import { CouchRescueTime } from 'model/rescuetime';
import fetch from 'node-fetch';

describe.skip('search data', () => {
  const couchdb = {
    host: process.env.COUCHDB || 'http://localhost:5984',
    Cookie: '',
  };

  beforeAll(async () => {
    // connect couchdb
    // FIXME prevent auth for does not rewrite data
    couchdb.Cookie = await signInCouchDBCookieAuth({
      host: couchdb.host,
      username: process.env.COUCHDB_USER!,
      password: process.env.COUCHDB_PASSWORD!,
    });

    expect(couchdb.Cookie.length).toBeGreaterThan(0);
  });

  test('should get rescuetime data', async () => {
    console.time('timer');
    const res = await fetch(`${couchdb.host}/rescuetime/_design/all/_view/all-view`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: couchdb.Cookie,
      },
    });
    console.timeEnd('timer');

    const view: View<CouchRescueTime> = await res.json();
    const results: Date[] = view.rows
      .map(({ value }) => value)
      .sort((a, b) => (a.date > b.date ? -1 : 1))
      .slice(0, 10)
      .map(({ date }) => new Date(date));

    console.log('search.test.ts..()', results);
  });
});
