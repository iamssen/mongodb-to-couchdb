import { BulkDocumentsParameters, View } from '@ssen/couchdb';
import { parseTimeStringToSeconds } from '@ssen/rescuetime';
import { parse } from 'date-fns';
import fs from 'fs-extra';
import { Auth, google, sheets_v4 } from 'googleapis';
import { CouchRescueTime } from 'model/rescuetime';
import fetch from 'node-fetch';
import path from 'path';

describe.skip('googlesheet migration scripts', () => {
  if (!process.env.DATA_STORE) {
    throw new Error(`Undefined $DATA_STORE env`);
  }
  const store: string = process.env.DATA_STORE;
  fs.mkdirpSync(store);

  let auth: Auth.GoogleAuth;
  let sheets: sheets_v4.Sheets;

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

    // connect google sheets
    auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheets = google.sheets({ version: 'v4', auth });
  });

  test.skip('should migrate google sheets rescuetime data', async () => {
    const spreadsheetId = '1kFJfP6kqX6LRXNOHBq5niddhSUbroxrb8bAKChuPeWg';

    const res = await fetch(`${couchdb.host}/rescuetime/_design/all/_view/all-view`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: couchdb.Cookie,
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

    const create = await fetch(`${couchdb.host}/rescuetime/_bulk_docs`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: couchdb.Cookie,
      },
      body: JSON.stringify({
        docs: rows,
      } as BulkDocumentsParameters<CouchRescueTime>),
    });

    expect(create.status).toBe(201);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: '시트1',
    });
  });

  test.skip('should add data that is not exists', async () => {
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

    const create = await fetch(`${couchdb.host}/rescuetime/_bulk_docs`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: couchdb.Cookie,
      },
      body: JSON.stringify({
        docs: rows,
      } as BulkDocumentsParameters<CouchRescueTime>),
    });

    expect(create.status).toBe(201);
  });
});
