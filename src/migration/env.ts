import { Fail, Session, SessionParameters } from '@ssen/couchdb';
import fs from 'fs-extra';
import { Auth, google, sheets_v4 } from 'googleapis';
import { Db, MongoClient } from 'mongodb';
import fetch from 'node-fetch';

export async function getStore(): Promise<string> {
  if (!process.env.DATA_STORE) {
    throw new Error(`Undefined $DATA_STORE`);
  }
  const store: string = process.env.DATA_STORE;
  await fs.mkdirp(store);

  return store;
}

export const host: string = process.env.COUCHDB || 'http://localhost:5984';

export async function getCookie(): Promise<string> {
  if (!process.env.COUCHDB_USER || !process.env.COUCHDB_PASSWORD) {
    throw new Error(`Undefined $COUCHDB_USER or $COUCHDB_PASSWORD`);
  }

  const res = await fetch(`${host}/_session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: process.env.COUCHDB_USER,
      password: process.env.COUCHDB_PASSWORD,
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

export function getGoogleSheets(): sheets_v4.Sheets {
  if (!process.env.GOOGLE_KEY) {
    throw new Error(`Undefined $GOOGLE_KEY`);
  }

  const auth: Auth.GoogleAuth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function getMongoDatabase(): Promise<Db> {
  const url = 'mongodb://localhost:27017';
  const dbName = 'dashboard';
  const client: MongoClient = await MongoClient.connect(url);
  const db: Db = client.db(dbName);
  return db;
}
