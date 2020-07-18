import { View } from '@ssen/couchdb';
import { parseTimeStringToSeconds } from '@ssen/rescuetime';
import { parse } from 'date-fns';
import fs from 'fs-extra';
import { CouchRescueTime } from 'model/rescuetime';
import fetch from 'node-fetch';
import path from 'path';
import { getCookie, getStore, host } from './env';

describe.skip('rescuetime activities migration scripts', () => {
  test.skip('should migrate rescuetime activities', async () => {
    const store = await getStore();
    const Cookie = await getCookie();

    const res = await fetch(`${host}/rescuetime/_design/all/_view/all-view`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie,
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

        //const update = await fetch(`${host}/rescuetime/${_id}`, {
        //  method: 'PUT',
        //  headers: {
        //    Accept: 'application/json',
        //    'Content-Type': 'application/json',
        //    'If-Match': _rev,
        //    Cookie,
        //  },
        //  body: JSON.stringify(next as PutDocumentParameters<CouchRescueTime>),
        //});
        //
        //expect(update.status).toBe(201);
      }
    }
  }, 50000);
});
