import { PutDocumentParameters, View } from '@ssen/couchdb';
import { parseTimeStringToSeconds } from '@ssen/rescuetime';
import { parse } from 'date-fns';
import fs from 'fs-extra';
import { CouchRescueTime } from 'model/rescuetime';
import fetch from 'node-fetch';
import path from 'path';

describe.skip('rescuetime activities migration scripts', () => {
  if (!process.env.DATA_STORE) {
    throw new Error(`Undefined $DATA_STORE env`);
  }
  const store: string = process.env.DATA_STORE;
  fs.mkdirpSync(store);

  const couchdb = {
    host: process.env.COUCHDB || 'http://localhost:5984',
    Cookie: '',
  };

  beforeAll(async () => {
    // connect couchdb
    // FIXME prevent auth for does not rewrite data
    //couchdb.Cookie = await signInCouchDBCookieAuth({
    //  host: couchdb.host,
    //  username: process.env.COUCHDB_USER!,
    //  password: process.env.COUCHDB_PASSWORD!,
    //});

    expect(couchdb.Cookie.length).toBeGreaterThan(0);
  });

  test('should migrate rescuetime activities', async () => {
    const res = await fetch(`${couchdb.host}/rescuetime/_design/all/_view/all-view`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: couchdb.Cookie,
      },
    });

    const view: View<CouchRescueTime> = await res.json();
    const origin: Map<number, { _id: string; _rev: string } & CouchRescueTime> = view.rows.reduce(
      (map, { value }) => {
        map.set(value.date, value);
        return map;
      },
      new Map<number, { _id: string; _rev: string } & CouchRescueTime>(),
    );

    const files = await fs.readdir(path.join(store, 'rescuetime'));
    const activityFiles = files.filter((fileName) => /^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}.json$/.test(fileName));

    for (const fileName of activityFiles) {
      const date: number = +parse(path.basename(fileName, '.json'), 'yyyy-M-d', new Date());
      const activities: { activity: string; time: string }[] = await fs.readJson(
        path.join(store, `rescuetime/${fileName}`),
      );

      if (origin.has(date) && Array.isArray(activities) && activities.length > 0) {
        const { _id, _rev, ...prev } = origin.get(date)!;
        const next: CouchRescueTime = {
          ...prev,
          activities: activities.map(({ activity, time }) => {
            return {
              activity,
              time: parseTimeStringToSeconds(time),
            };
          }),
        };

        const update = await fetch(`${couchdb.host}/rescuetime/${_id}`, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'If-Match': _rev,
            Cookie: couchdb.Cookie,
          },
          body: JSON.stringify(next as PutDocumentParameters<CouchRescueTime>),
        });

        expect(update.status).toBe(201);
      }
    }
  }, 50000);
});
