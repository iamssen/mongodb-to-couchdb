import { BulkDocumentsParameters } from '@ssen/couchdb';
import fs from 'fs-extra';
import { CouchBody, MongoWeight } from 'model/body';
import { CouchEarning, CouchExpense, MongoExpense, MongoIncome } from 'model/moneybook';
import { CouchRescueTime, MongoRescueTime } from 'model/rescuetime';
import { Db, MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import path from 'path';

describe.skip('mongodb to couchdb migration scripts', () => {
  if (!process.env.DATA_STORE) {
    throw new Error(`Undefined $DATA_STORE env`);
  }
  const store: string = process.env.DATA_STORE;
  fs.mkdirpSync(store);

  let client: MongoClient;
  let db: Db;

  const couchdb = {
    host: process.env.COUCHDB || 'http://localhost:5984',
    Cookie: '',
  };

  beforeAll(async () => {
    // connect mongodb
    const url = 'mongodb://localhost:27017';
    const dbName = 'dashboard';
    client = await MongoClient.connect(url);
    db = client.db(dbName);

    // connect couchdb
    // FIXME prevent auth for does not rewrite data
    //couchdb.Cookie = await signInCouchDBCookieAuth({
    //  host: couchdb.host,
    //  username: process.env.COUCHDB_USER!,
    //  password: process.env.COUCHDB_PASSWORD!,
    //});
    //
    //expect(couchdb.Cookie.length).toBeGreaterThan(0);
  });

  afterAll(() => {
    client.close();
  });

  // ---------------------------------------------
  // mongo to
  // ---------------------------------------------
  test('should get mongodb collections', async () => {
    const collections = await db.collections();
    console.log(collections.map(({ namespace }) => namespace));
  });

  test('should migrate expenses data', async () => {
    const col = await db.collection<MongoExpense>('expense');
    const data = await col.find({}).toArray();

    const create = await fetch(`${couchdb.host}/expenses/_bulk_docs`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: couchdb.Cookie,
      },
      body: JSON.stringify({
        docs: data.map(({ amount, category, currency, date, description }) => ({
          amount,
          date: +date,
          category,
          currency,
          description,
        })),
      } as BulkDocumentsParameters<CouchExpense>),
    });

    expect(create.status).toBe(201);

    await fs.writeJson(
      path.join(store, 'expenses.json'),
      data.map(({ amount, category, currency, date, description }) => {
        return {
          amount,
          category,
          currency,
          date,
          description,
        };
      }),
    );
  });

  test('should migrate earnings data', async () => {
    const col = await db.collection<MongoIncome>('income');
    const data = await col.find({}).toArray();

    const create = await fetch(`${couchdb.host}/earnings/_bulk_docs`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: couchdb.Cookie,
      },
      body: JSON.stringify({
        docs: data.map(({ date, description, category, amount }) => ({
          amount,
          date: +date,
          category,
          description,
        })),
      } as BulkDocumentsParameters<CouchEarning>),
    });

    expect(create.status).toBe(201);

    await fs.writeJson(
      path.join(store, 'earnings.json'),
      data.map(({ amount, category, date, description }) => {
        return {
          amount,
          category,
          date,
          description,
        };
      }),
    );
  });

  test('should migrate body data', async () => {
    const col = await db.collection<MongoWeight>('weight');
    const data = await col.find({}).toArray();

    const create = await fetch(`${couchdb.host}/body/_bulk_docs`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: couchdb.Cookie,
      },
      body: JSON.stringify({
        docs: data.map(({ date, weight, bodyfat, waist }) => ({
          date: +date,
          weight,
          bodyfat,
          waist,
        })),
      } as BulkDocumentsParameters<CouchBody>),
    });

    expect(create.status).toBe(201);

    await fs.writeJson(
      path.join(store, 'body.json'),
      data.map(({ date, weight, bodyfat, waist }) => {
        return {
          date,
          weight,
          bodyfat,
          waist,
        };
      }),
    );
  });

  test('should migrate rescuetime data', async () => {
    const col = await db.collection<MongoRescueTime>('rescuetime');
    const data = await col.find({}).toArray();

    const create = await fetch(`${couchdb.host}/rescuetime/_bulk_docs`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: couchdb.Cookie,
      },
      body: JSON.stringify({
        docs: data.map(
          ({
            allDistracting,
            allProductive,
            business,
            communicationAndScheduling,
            date,
            designAndComposition,
            distracting,
            entertainment,
            neutral,
            news,
            productive,
            referenceAndLearning,
            shopping,
            socialNetworking,
            softwareDevelopment,
            total,
            utilities,
            veryDistracting,
            veryProductive,
          }) => ({
            date: +date,
            allDistracting,
            allProductive,
            business,
            communicationAndScheduling,
            designAndComposition,
            distracting,
            entertainment,
            neutral,
            news,
            productive,
            referenceAndLearning,
            shopping,
            socialNetworking,
            softwareDevelopment,
            total,
            utilities,
            veryDistracting,
            veryProductive,
          }),
        ),
      } as BulkDocumentsParameters<CouchRescueTime>),
    });

    expect(create.status).toBe(201);

    await fs.writeJson(
      path.join(store, 'rescuetime.json'),
      data.map(
        ({
          allDistracting,
          allProductive,
          business,
          communicationAndScheduling,
          date,
          designAndComposition,
          distracting,
          entertainment,
          neutral,
          news,
          productive,
          referenceAndLearning,
          shopping,
          socialNetworking,
          softwareDevelopment,
          total,
          utilities,
          veryDistracting,
          veryProductive,
        }) => {
          return {
            allDistracting,
            allProductive,
            business,
            communicationAndScheduling,
            date,
            designAndComposition,
            distracting,
            entertainment,
            neutral,
            news,
            productive,
            referenceAndLearning,
            shopping,
            socialNetworking,
            softwareDevelopment,
            total,
            utilities,
            veryDistracting,
            veryProductive,
          };
        },
      ),
    );
  });
});
