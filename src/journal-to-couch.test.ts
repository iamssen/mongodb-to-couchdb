import { BulkDocumentsParameters } from '@ssen/couchdb';
import fs from 'fs-extra';
import { CouchJournal, Dayone, Journey } from 'model/journal';
import fetch from 'node-fetch';
import path from 'path';

describe.skip('journal migration scripts', () => {
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

  test.skip('should migrate dayone data', async () => {
    const { entries }: { entries: Dayone[] } = fs.readJsonSync(path.join(store, 'dayone/Journal.json'));

    const attatchments: Map<string, string> = new Map<string, string>();

    for (const { photos } of entries) {
      if (photos && Array.isArray(photos)) {
        for (const photo of photos) {
          const file: string = path.join(store, `dayone/photos/${photo.md5}.${photo.type}`);
          const source: string = fs.readFileSync(file, 'base64').replace(/[\r\n]+/gm, '');
          const datauri: string = `data:image/${photo.type};base64,${source}`;
          attatchments.set(photo.identifier, datauri);
        }
      }
    }

    const moment: RegExp = /\(dayone-moment:\/\/([A-Z0-9]+)\)/;

    const data: CouchJournal[] = entries.map(({ text, modifiedDate, weather, location }, i) => {
      let markdown: string = text.replace(/\\/g, '');

      if (moment.test(markdown)) {
        markdown = markdown.replace(moment, (match: string, identifier: string) => {
          const datauri: string | undefined = attatchments.get(identifier);
          if (!datauri) {
            throw new Error(`Undefined identifier "${identifier}"`);
          }
          return `(${datauri})`;
        });
      }

      return {
        markdown,
        date: +new Date(modifiedDate),
        weather: weather
          ? {
              sunsetDate: +new Date(weather.sunsetDate),
              weatherServiceName: weather.weatherServiceName,
              temperatureCelsius: weather.temperatureCelsius,
              windBearing: weather.windBearing,
              sunriseDate: +new Date(weather.sunriseDate),
              conditionsDescription: weather.conditionsDescription,
              pressureMB: weather.pressureMB,
              visibilityKM: weather.visibilityKM,
              relativeHumidity: weather.relativeHumidity,
              windSpeedKPH: weather.windSpeedKPH,
              weatherCode: weather.weatherCode,
              windChillCelsius: weather.windChillCelsius,
            }
          : undefined,
        location: location
          ? {
              longitude: location.longitude,
              latitude: location.latitude,
            }
          : undefined,
      };
    });

    const create = await fetch(`${couchdb.host}/journal/_bulk_docs`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: couchdb.Cookie,
      },
      body: JSON.stringify({
        docs: data,
      } as BulkDocumentsParameters<CouchJournal>),
    });

    expect(create.status).toBe(201);
  });

  test.skip('should migrate journey data', async () => {
    const files: string[] = fs.readdirSync(path.join(store, 'journey')).filter((file) => /.json$/.test(file));

    const data: CouchJournal[] = [];

    for (const file of files) {
      const { text, lon, lat, date_modified, photos, weather }: Journey = await fs.readJson(
        path.join(store, `journey/${file}`),
      );

      const photoMarkdown: string[] = [];

      if (photos && photos.length > 0) {
        for (const photo of photos) {
          const file: string = path.join(store, `journey/${photo}`);
          const source: string = fs.readFileSync(file, 'base64').replace(/[\r\n]+/gm, '');
          const datauri: string = `data:image/${path.extname(photo)};base64,${source}`;
          photoMarkdown.push(`![](${datauri})`);
        }
      }

      const markdown: string = photoMarkdown.join('\n\n') + text;

      data.push({
        markdown,
        date: date_modified,
        location:
          typeof lon === 'number' && typeof lat === 'number'
            ? {
                longitude: lon,
                latitude: lat,
              }
            : undefined,
        weather:
          weather && weather.id >= 0 && weather.icon.length > 0
            ? {
                id: weather.id,
                degree_c: weather.degree_c,
                description: weather.description,
                icon: weather.icon,
                place: weather.place,
              }
            : undefined,
      });
    }

    const create = await fetch(`${couchdb.host}/journal/_bulk_docs`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: couchdb.Cookie,
      },
      body: JSON.stringify({
        docs: data,
      } as BulkDocumentsParameters<CouchJournal>),
    });

    expect(create.status).toBe(201);
  });
});
