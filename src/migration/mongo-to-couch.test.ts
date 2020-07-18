import fs from 'fs-extra';
import { MongoWeight } from 'model/body';
import { MongoExpense, MongoIncome } from 'model/moneybook';
import { MongoRescueTime } from 'model/rescuetime';
import path from 'path';
import { getCookie, getMongoDatabase, getStore } from './env';

describe.skip('mongodb to couchdb migration scripts', () => {
  test('should get mongodb collections', async () => {
    const db = await getMongoDatabase();

    const collections = await db.collections();
    console.log(collections.map(({ namespace }) => namespace));
  });

  test('should migrate expenses data', async () => {
    const store = await getStore();
    const db = await getMongoDatabase();
    const Cookie = await getCookie();

    const col = await db.collection<MongoExpense>('expense');
    const data = await col.find({}).toArray();

    //const create = await fetch(`${host}/expenses/_bulk_docs`, {
    //  method: 'POST',
    //  headers: {
    //    Accept: 'application/json',
    //    'Content-Type': 'application/json',
    //    Cookie,
    //  },
    //  body: JSON.stringify({
    //    docs: data.map(({ amount, category, currency, date, description }) => ({
    //      amount,
    //      date: +date,
    //      category,
    //      currency,
    //      description,
    //    })),
    //  } as BulkDocumentsParameters<CouchExpense>),
    //});
    //
    //expect(create.status).toBe(201);

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
    const store = await getStore();
    const db = await getMongoDatabase();
    const Cookie = await getCookie();

    const col = await db.collection<MongoIncome>('income');
    const data = await col.find({}).toArray();

    //const create = await fetch(`${host}/earnings/_bulk_docs`, {
    //  method: 'POST',
    //  headers: {
    //    Accept: 'application/json',
    //    'Content-Type': 'application/json',
    //    Cookie,
    //  },
    //  body: JSON.stringify({
    //    docs: data.map(({ date, description, category, amount }) => ({
    //      amount,
    //      date: +date,
    //      category,
    //      description,
    //    })),
    //  } as BulkDocumentsParameters<CouchEarning>),
    //});
    //
    //expect(create.status).toBe(201);

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
    const store = await getStore();
    const db = await getMongoDatabase();
    const Cookie = await getCookie();

    const col = await db.collection<MongoWeight>('weight');
    const data = await col.find({}).toArray();

    //const create = await fetch(`${host}/body/_bulk_docs`, {
    //  method: 'POST',
    //  headers: {
    //    Accept: 'application/json',
    //    'Content-Type': 'application/json',
    //    Cookie,
    //  },
    //  body: JSON.stringify({
    //    docs: data.map(({ date, weight, bodyfat, waist }) => ({
    //      date: +date,
    //      weight,
    //      bodyfat,
    //      waist,
    //    })),
    //  } as BulkDocumentsParameters<CouchBody>),
    //});
    //
    //expect(create.status).toBe(201);

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
    const store = await getStore();
    const db = await getMongoDatabase();
    const Cookie = await getCookie();

    const col = await db.collection<MongoRescueTime>('rescuetime');
    const data = await col.find({}).toArray();

    //const create = await fetch(`${host}/rescuetime/_bulk_docs`, {
    //  method: 'POST',
    //  headers: {
    //    Accept: 'application/json',
    //    'Content-Type': 'application/json',
    //    Cookie,
    //  },
    //  body: JSON.stringify({
    //    docs: data.map(
    //      ({
    //        allDistracting,
    //        allProductive,
    //        business,
    //        communicationAndScheduling,
    //        date,
    //        designAndComposition,
    //        distracting,
    //        entertainment,
    //        neutral,
    //        news,
    //        productive,
    //        referenceAndLearning,
    //        shopping,
    //        socialNetworking,
    //        softwareDevelopment,
    //        total,
    //        utilities,
    //        veryDistracting,
    //        veryProductive,
    //      }) => ({
    //        date: +date,
    //        allDistracting,
    //        allProductive,
    //        business,
    //        communicationAndScheduling,
    //        designAndComposition,
    //        distracting,
    //        entertainment,
    //        neutral,
    //        news,
    //        productive,
    //        referenceAndLearning,
    //        shopping,
    //        socialNetworking,
    //        softwareDevelopment,
    //        total,
    //        utilities,
    //        veryDistracting,
    //        veryProductive,
    //      }),
    //    ),
    //  } as BulkDocumentsParameters<CouchRescueTime>),
    //});
    //
    //expect(create.status).toBe(201);

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
