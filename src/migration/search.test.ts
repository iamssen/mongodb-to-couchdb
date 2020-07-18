import { View } from '@ssen/couchdb';
import { CouchRescueTime } from 'model/rescuetime';
import fetch from 'node-fetch';
import { getCookie, host } from './env';

describe('search data', () => {
  test.skip('should get rescuetime data', async () => {
    const Cookie = await getCookie();

    console.time('timer');
    const res = await fetch(`${host}/rescuetime/_design/all/_view/all-view`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie,
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
