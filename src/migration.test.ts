import { BulkDocumentsParameters, Fail, Session, SessionParameters } from '@ssen/couchdb';
import fs from 'fs-extra';
import { Db, MongoClient, ObjectID } from 'mongodb';
import fetch from 'node-fetch';
import path from 'path';

type Expense = {
  _id: ObjectID;
  amount: number;
  category: string;
  currency: string;
  date: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

type CouchExpense = {
  amount: number;
  category: string;
  currency: string;
  date: number;
  description: string;
};

type Income = {
  _id: ObjectID;
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

type CouchEarning = {
  amount: number;
  category: string;
  description: string;
  date: number;
};

type RescueTime = {
  _id: ObjectID;
  allDistracting: number;
  allProductive: number;
  business: number;
  communicationAndScheduling: number;
  date: Date;
  designAndComposition: number;
  distracting: number;
  entertainment: number;
  neutral: number;
  news: number;
  productive: number;
  referenceAndLearning: number;
  shopping: number;
  socialNetworking: number;
  softwareDevelopment: number;
  total: number;
  utilities: number;
  veryDistracting: number;
  veryProductive: number;
  createdAt: Date;
  updatedAt: Date;
};

type CouchRescueTime = {
  allDistracting: number;
  allProductive: number;
  business: number;
  communicationAndScheduling: number;
  date: number;
  designAndComposition: number;
  distracting: number;
  entertainment: number;
  neutral: number;
  news: number;
  productive: number;
  referenceAndLearning: number;
  shopping: number;
  socialNetworking: number;
  softwareDevelopment: number;
  total: number;
  utilities: number;
  veryDistracting: number;
  veryProductive: number;
};

type Weight = {
  _id: ObjectID;
  date: Date;
  weight: number;
  bodyfat: number;
  waist: number;
  createdAt: Date;
  updatedAt: Date;
};

type CouchBody = {
  date: number;
  weight: number;
  bodyfat: number;
  waist: number;
};

const store: string = process.env.DATA_STORE || path.join(__dirname, '../store');
fs.mkdirpSync(store);

describe.skip('moneybook migration scripts', () => {
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
    const session = await fetch(`${couchdb.host}/_session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: process.env.COUCHDB_USER,
        password: process.env.COUCHDB_PASSWORD,
      } as SessionParameters),
    });

    expect(session.status).toBe(200);
    expect(session.headers.has('set-cookie')).toBeTruthy();

    const sessionBody: Session | Fail = await session.json();

    expect(sessionBody).toMatchObject({ ok: true });

    // FIXME prevent auth for does not rewrite data
    //couchdb.Cookie = session.headers
    //  .get('set-cookie')!
    //  .split(',')
    //  .map((item) => item.split(';')[0])
    //  .join(';');
    //
    //expect(typeof couchdb.Cookie).toBe('string');
  });

  afterAll(() => {
    client.close();
  });

  test('should get mongodb collections', async () => {
    const collections = await db.collections();
    console.log(collections.map(({ namespace }) => namespace));
  });

  test('should migration expenses data', async () => {
    const col = await db.collection<Expense>('expense');
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

  test('should migration earnings data', async () => {
    const col = await db.collection<Income>('income');
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

  test('should migration body data', async () => {
    const col = await db.collection<Weight>('weight');
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

  test('should migration rescuetime data', async () => {
    const col = await db.collection<RescueTime>('rescuetime');
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
