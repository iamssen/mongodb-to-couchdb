import { View } from '@ssen/couchdb';
import { parseTimeStringToSeconds } from '@ssen/rescuetime';
import { parse } from 'date-fns';
import fs from 'fs-extra';
import { CouchRescueTime } from 'model/rescuetime';
import fetch from 'node-fetch';
import path from 'path';
import { getCookie, getGoogleSheets, getStore, host } from './env';

describe.skip('googlesheet migration scripts', () => {
  test.skip('should migrate google sheets rescuetime data', async () => {
    const store = await getStore();
    const Cookie = await getCookie();
    const sheets = getGoogleSheets();

    const spreadsheetId = '1kFJfP6kqX6LRXNOHBq5niddhSUbroxrb8bAKChuPeWg';

    const res = await fetch(`${host}/rescuetime/_design/all/_view/all-view`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie,
      },
    });

    const view: View<CouchRescueTime> = await res.json();
    const latest = view.rows.map(({ value }) => value).sort((a, b) => (a.date > b.date ? -1 : 1))[0].date;

    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '시트1!A:S',
    });

    await fs.writeJson(path.join(store, 'rescuetime-googlesheets.json'), data);

    const rows: CouchRescueTime[] | undefined = data.values
      ?.map(
        ([
          date,
          total,
          allProductive,
          allDistracting,
          veryProductive,
          productive,
          neutral,
          distracting,
          veryDistracting,
          business,
          communicationAndScheduling,
          socialNetworking,
          designAndComposition,
          entertainment,
          news,
          softwareDevelopment,
          referenceAndLearning,
          shopping,
          utilities,
        ]: string[]) => {
          return {
            date: +parse(date, 'MMMM d, yyyy', new Date()),
            total: parseTimeStringToSeconds(total),
            allProductive: parseTimeStringToSeconds(allProductive),
            allDistracting: parseTimeStringToSeconds(allDistracting),
            veryProductive: parseTimeStringToSeconds(veryProductive),
            productive: parseTimeStringToSeconds(productive),
            neutral: parseTimeStringToSeconds(neutral),
            distracting: parseTimeStringToSeconds(distracting),
            veryDistracting: parseTimeStringToSeconds(veryDistracting),
            business: parseTimeStringToSeconds(business),
            communicationAndScheduling: parseTimeStringToSeconds(communicationAndScheduling),
            socialNetworking: parseTimeStringToSeconds(socialNetworking),
            designAndComposition: parseTimeStringToSeconds(designAndComposition),
            entertainment: parseTimeStringToSeconds(entertainment),
            news: parseTimeStringToSeconds(news),
            softwareDevelopment: parseTimeStringToSeconds(softwareDevelopment),
            referenceAndLearning: parseTimeStringToSeconds(referenceAndLearning),
            shopping: parseTimeStringToSeconds(shopping),
            utilities: parseTimeStringToSeconds(utilities),
          };
        },
      )
      .filter(({ date }) => date > latest);

    //const create = await fetch(`${host}/rescuetime/_bulk_docs`, {
    //  method: 'POST',
    //  headers: {
    //    Accept: 'application/json',
    //    'Content-Type': 'application/json',
    //    Cookie,
    //  },
    //  body: JSON.stringify({
    //    docs: rows,
    //  } as BulkDocumentsParameters<CouchRescueTime>),
    //});
    //
    //expect(create.status).toBe(201);
    //
    //await sheets.spreadsheets.values.clear({
    //  spreadsheetId,
    //  range: '시트1',
    //});
  });

  test.skip('should add data that is not exists', async () => {
    const store = await getStore();
    const Cookie = await getCookie();
    const sheets = getGoogleSheets();

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

    const data = await fs.readJson(path.join(store, 'rescuetime-googlesheets.json'));

    const rows: CouchRescueTime[] | undefined = data.values
      ?.map(
        ([
          date,
          total,
          allProductive,
          allDistracting,
          veryProductive,
          productive,
          neutral,
          distracting,
          veryDistracting,
          business,
          communicationAndScheduling,
          socialNetworking,
          designAndComposition,
          entertainment,
          news,
          softwareDevelopment,
          referenceAndLearning,
          shopping,
          utilities,
        ]: string[]) => {
          return {
            date: +parse(date, 'MMMM d, yyyy', new Date()),
            total: parseTimeStringToSeconds(total),
            allProductive: parseTimeStringToSeconds(allProductive),
            allDistracting: parseTimeStringToSeconds(allDistracting),
            veryProductive: parseTimeStringToSeconds(veryProductive),
            productive: parseTimeStringToSeconds(productive),
            neutral: parseTimeStringToSeconds(neutral),
            distracting: parseTimeStringToSeconds(distracting),
            veryDistracting: parseTimeStringToSeconds(veryDistracting),
            business: parseTimeStringToSeconds(business),
            communicationAndScheduling: parseTimeStringToSeconds(communicationAndScheduling),
            socialNetworking: parseTimeStringToSeconds(socialNetworking),
            designAndComposition: parseTimeStringToSeconds(designAndComposition),
            entertainment: parseTimeStringToSeconds(entertainment),
            news: parseTimeStringToSeconds(news),
            softwareDevelopment: parseTimeStringToSeconds(softwareDevelopment),
            referenceAndLearning: parseTimeStringToSeconds(referenceAndLearning),
            shopping: parseTimeStringToSeconds(shopping),
            utilities: parseTimeStringToSeconds(utilities),
          };
        },
      )
      .filter(({ date }) => !origin.has(date));

    //const create = await fetch(`${host}/rescuetime/_bulk_docs`, {
    //  method: 'POST',
    //  headers: {
    //    Accept: 'application/json',
    //    'Content-Type': 'application/json',
    //    Cookie,
    //  },
    //  body: JSON.stringify({
    //    docs: rows,
    //  } as BulkDocumentsParameters<CouchRescueTime>),
    //});
    //
    //expect(create.status).toBe(201);
  });
});
