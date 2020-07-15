import { AllDocuments, Database } from '@ssen/couchdb';
import { Db, MongoClient, ObjectID } from 'mongodb';
import fetch from 'node-fetch';

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

describe.skip('moneybook migration scripts', () => {
  let client: MongoClient, db: Db;

  beforeAll(async () => {
    const url = 'mongodb://localhost:27017';
    const dbName = 'dashboard';
    client = await MongoClient.connect(url);
    db = client.db(dbName);
  });

  afterAll(() => {
    client.close();
  });

  test('should get mongodb collections', async () => {
    const collections = await db.collections();

    console.log(collections.map(({ namespace }) => namespace));
  });

  test('should get all expense data from mongodb', async () => {
    const col = await db.collection<Expense>('expense');

    const expenses = await col.find({}).toArray();

    console.log('migration.test.ts..()', expenses);
  });

  test('should get /db', async () => {
    const dbRes = await fetch('http://127.0.0.1:5984/test');
    const db: Database = await dbRes.json();

    console.log('migration.test.ts..()', db);
  });

  test('should get all docs from test', async () => {
    const allDocsRes = await fetch('http://127.0.0.1:5984/test/_all_docs');

    const allDocs: AllDocuments = await allDocsRes.json();

    console.log('migration.test.ts..()', allDocs);

    const res = await fetch('http://127.0.0.1:5984/test/_bulk_get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        docs: allDocs.rows.map(({ id }) => ({ id })),
      }),
    });
    const json = await res.json();

    console.log('migration.test.ts..()', json);
  });
});
