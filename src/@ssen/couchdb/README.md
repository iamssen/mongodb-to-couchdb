# CouchDB Typescript Helper

## Typescript Definitions
<!-- import request.ts -->

```ts
export interface SessionParameters {
  name: string;
  password: string;
}

export interface PutDatabaseParameters {
  q?: number; // = 8
  n?: number; // = 3
  partitioned: boolean; // = false
}

export interface PostAllDocumentsParameters {
  keys: string[];
}

export type PostDatabaseParameters<T extends {}> = {
  batch?: 'ok';
} & T;

export type PutDocumentParameters<T extends {}> = {
  rev?: string; // or using "If-Match" http header
  batch?: 'ok';
  new_edits?: boolean; // = true
} & T;

export interface BulkGetParameters {
  docs: {
    id: string;
    rev?: string;
  }[];
}

export type BulkDocumentsParameters<T extends {}> = {
  docs: ({
    _id?: string;
    _rev?: string;
    _deleted?: true;
  } & T)[];
  new_edits?: boolean; // = true
};

export type FindParameters<T extends {}> = {
  selector: Record<
    keyof T,
    Record<'$regex' | '$eq' | '$gt' | '$gte' | '$lt' | '$lte' | '$ne', string | number | boolean | Date>
  >;
  limit?: number; // = 25
  skip?: number;
  sort?: Record<keyof T, 'asc' | 'desc'>[];
  fields?: unknown;
  use_index?: string | string[];
  r?: number; // = 1
  bookmark?: string;
  update?: boolean; // = true
  stable?: boolean;
  stale?: 'ok' | false; // = false
  execution_stats?: boolean; // = false
};

```

<!-- importend -->

<!-- import response.ts -->

```ts
export interface Session {
  ok: boolean;
  name: string;
  roles: string[];
}

export interface Fail {
  error: string;
  reason: string;
}

export interface Success {
  ok: boolean;
}

export interface Create extends Success {
  id: string;
  rev: string;
}

export type Document<T extends {}> = {
  _id: string;
  _rev?: string;
  _deleted?: boolean;
  _attachments?: object;
  _conflicts?: unknown[];
  _deleted_conflicts?: unknown[];
  _local_seq?: string;
  _revs_info?: unknown[];
  _revisions?: object;
} & T;

export interface Documents {
  offset: number;
  rows: {
    id: string;
    key: string;
    value: {
      rev: string;
    };
  }[];
  total_rows: number;
  update_seq: number;
}

export interface View<T extends {}> {
  offset: number;
  total_rows: number;
  rows: {
    id: string;
    key: string;
    value: { _id: string; _rev: string } & T;
  }[];
}

export interface Find<T extends {}> {
  docs: ({
    _id: string;
    _rev: string;
  } & T)[];

  warning: string;

  bookmark: string;

  execution_stats: {
    total_keys_examined: number;
    total_docs_examined: number;
    total_quorum_docs_examined: number;
    results_returned: number;
    execution_time_ms: number;
  };
}

export interface Database {
  db_name: string;
  purge_seq: string;
  update_seq: string;
  sizes: {
    file: number;
    external: number;
    active: number;
  };
  doc_del_count: number;
  doc_count: number;
  disk_format_version: number;
  compact_running: boolean;
  cluster: {
    q: number;
    n: number;
    w: number;
    r: number;
  };
  instance_start_time: string;
}

```

<!-- importend -->

# Test Codes

<!-- import __tests__/*.ts -->

```ts
import {
  Documents,
  BulkDocumentsParameters,
  Create,
  Database,
  Document,
  Fail,
  Find,
  FindParameters,
  PostDatabaseParameters,
  PutDocumentParameters,
  Session,
  SessionParameters,
  Success,
} from '@ssen/couchdb';
import fetch from 'node-fetch';

describe('couchdb', () => {
  const domain: string = process.env.COUCHDB || 'http://localhost:5984';
  const db: string = 'testdb';

  let Cookie: string;

  type TestDocument = {
    title: string;
    number: number;
    date: Date;
    boolean: boolean;
  };

  test(`should work every APIs`, async () => {
    // ---------------------------------------------
    // auth
    // ---------------------------------------------
    // auth with cookie
    // https://docs.couchdb.org/en/stable/api/server/authn.html#cookie-authentication
    const session = await fetch(`${domain}/_session`, {
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

    Cookie = session.headers
      .get('set-cookie')!
      .split(',')
      .map((item) => item.split(';')[0])
      .join(';');

    expect(typeof Cookie).toBe('string');

    // ---------------------------------------------
    // clean database if exists
    // ---------------------------------------------
    const hasDatabase = await fetch(`${domain}/${db}`, {
      method: 'GET',
      headers: {
        Cookie,
      },
    });

    if (hasDatabase.status === 200) {
      await fetch(`${domain}/${db}`, {
        method: 'DELETE',
        headers: {
          Cookie,
        },
      });
    }

    // ---------------------------------------------
    // set database
    // ---------------------------------------------
    // create a new database
    // https://docs.couchdb.org/en/stable/api/database/common.html#put--db
    const createDatabase = await fetch(`${domain}/${db}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Cookie,
      },
    });

    expect(createDatabase.status).toBe(201);

    const createDatabaseBody: Success | Fail = await createDatabase.json();

    expect(createDatabaseBody).toMatchObject({ ok: true });

    // read the specific database
    // https://docs.couchdb.org/en/stable/api/database/common.html#get--db
    const database = await fetch(`${domain}/${db}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie,
      },
    });

    expect(database.status).toBe(200);

    const databaseBody: Database | Fail = await database.json();

    if ('error' in databaseBody) {
      throw new Error(databaseBody.error);
    }

    expect(databaseBody.db_name).toBe(db);
    expect(typeof databaseBody.purge_seq).toBe('string');
    expect(typeof databaseBody.update_seq).toBe('string');
    expect(typeof databaseBody.sizes.file).toBe('number');
    expect(typeof databaseBody.sizes.external).toBe('number');
    expect(typeof databaseBody.sizes.active).toBe('number');
    expect(typeof databaseBody.doc_del_count).toBe('number');
    expect(typeof databaseBody.doc_count).toBe('number');
    expect(typeof databaseBody.disk_format_version).toBe('number');
    expect(typeof databaseBody.compact_running).toBe('boolean');
    expect(typeof databaseBody.cluster.q).toBe('number');
    expect(typeof databaseBody.cluster.n).toBe('number');
    expect(typeof databaseBody.cluster.w).toBe('number');
    expect(typeof databaseBody.cluster.r).toBe('number');
    expect(typeof databaseBody.instance_start_time).toBe('string');

    // ---------------------------------------------
    // CRUD documents
    // ---------------------------------------------
    const doc1: TestDocument = {
      title: 'first doc',
      number: 1,
      date: new Date(),
      boolean: false,
    };

    const doc2: TestDocument = {
      title: 'modified doc',
      number: 2,
      date: new Date(),
      boolean: true,
    };

    // create a document
    // https://docs.couchdb.org/en/stable/api/database/common.html#post--db
    const postDatabase = await fetch(`${domain}/${db}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie,
      },
      body: JSON.stringify(doc1 as PostDatabaseParameters<TestDocument>),
    });

    expect(postDatabase.status).toBe(201);

    const postDatabaseBody: Create | Fail = await postDatabase.json();

    if ('error' in postDatabaseBody) {
      throw new Error(postDatabaseBody.error);
    }

    expect(postDatabaseBody.ok).toBeTruthy();
    expect(typeof postDatabaseBody.id).toBe('string');
    expect(typeof postDatabaseBody.rev).toBe('string');

    // read the specific document
    // https://docs.couchdb.org/en/stable/api/document/common.html#get--db-docid
    const readDocument = await fetch(`${domain}/${db}/${postDatabaseBody.id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie,
      },
    });

    expect(readDocument.status).toBe(200);

    const readDocumentBody: Document<TestDocument> | Fail = await readDocument.json();

    if ('error' in readDocumentBody) {
      throw new Error(readDocumentBody.error);
    }

    readDocumentBody.date = new Date(readDocumentBody.date);

    expect(readDocumentBody._id).toBe(postDatabaseBody.id);
    expect(readDocumentBody._rev).toBe(postDatabaseBody.rev);
    expect(readDocumentBody.title).toBe(doc1.title);
    expect(readDocumentBody.number).toBe(doc1.number);
    expect(+readDocumentBody.date).toBe(+doc1.date);
    expect(readDocumentBody.boolean).toBe(doc1.boolean);

    // update the spcific document
    // https://docs.couchdb.org/en/stable/api/document/common.html#updating-an-existing-document
    const updateDocument = await fetch(`${domain}/${db}/${postDatabaseBody.id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'If-Match': postDatabaseBody.rev,
        Cookie,
      },
      body: JSON.stringify(doc2 as PutDocumentParameters<TestDocument>),
    });

    expect(updateDocument.status).toBe(201);

    const updateDatabaseBody: Create | Fail = await updateDocument.json();

    if ('error' in updateDatabaseBody) {
      throw new Error(updateDatabaseBody.error);
    }

    expect(updateDatabaseBody.ok).toBeTruthy();
    expect(typeof updateDatabaseBody.id).toBe('string');
    expect(typeof updateDatabaseBody.rev).toBe('string');

    const readUpdatedDocument = await fetch(`${domain}/${db}/${postDatabaseBody.id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie,
      },
    });

    expect(readUpdatedDocument.status).toBe(200);

    const readUpdatedDocumentBody: Document<TestDocument> | Fail = await readUpdatedDocument.json();

    if ('error' in readUpdatedDocumentBody) {
      throw new Error(readUpdatedDocumentBody.error);
    }

    readUpdatedDocumentBody.date = new Date(readUpdatedDocumentBody.date);

    expect(readUpdatedDocumentBody._id).toBe(updateDatabaseBody.id);
    expect(readUpdatedDocumentBody._rev).toBe(updateDatabaseBody.rev);
    expect(readUpdatedDocumentBody.title).toBe(doc2.title);
    expect(readUpdatedDocumentBody.number).toBe(doc2.number);
    expect(+readUpdatedDocumentBody.date).toBe(+doc2.date);
    expect(readUpdatedDocumentBody.boolean).toBe(doc2.boolean);

    // delete the specific document
    // https://docs.couchdb.org/en/stable/api/document/common.html#delete--db-docid
    const deleteDocument = await fetch(`${domain}/${db}/${postDatabaseBody.id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'If-Match': updateDatabaseBody.rev,
        Cookie,
      },
    });

    expect(deleteDocument.status).toBe(200);

    const deleteDocumentBody: Create | Fail = await deleteDocument.json();

    if ('error' in deleteDocumentBody) {
      throw new Error(deleteDocumentBody.error);
    }

    expect(deleteDocumentBody.ok).toBeTruthy();
    expect(typeof deleteDocumentBody.id).toBe('string');

    const readDeletedDocument = await fetch(`${domain}/${db}/${postDatabaseBody.id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie,
      },
    });

    expect(readDeletedDocument.status).toBe(404);

    const readDeletedDocumentBody: Document<TestDocument> | Fail = await readDeletedDocument.json();

    if ('_id' in readDeletedDocumentBody) {
      throw new Error(`should not get the deleted document`);
    }

    expect(readDeletedDocumentBody.error).toBe('not_found');
    expect(typeof readDeletedDocumentBody.reason).toBe('string');

    // ---------------------------------------------
    // bulk CRUD documents
    // ---------------------------------------------
    const docs1: TestDocument[] = Array.from({ length: 10 }, (_, i) => ({
      title: `title-${i}`,
      number: i,
      boolean: true,
      date: new Date(),
    }));

    const docs2: TestDocument[] = Array.from({ length: 10 }, (_, i) => ({
      title: `foo-${i}`,
      number: i * 10,
      boolean: false,
      date: new Date(),
    }));

    // create documents
    // https://docs.couchdb.org/en/stable/api/database/bulk-api.html#db-bulk-docs
    const createDocuments = await fetch(`${domain}/${db}/_bulk_docs`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie,
      },
      body: JSON.stringify({
        docs: docs1,
      } as BulkDocumentsParameters<TestDocument>),
    });

    expect(createDocuments.status).toBe(201);

    const createDocumentsBody: Create[] | Fail = await createDocuments.json();

    if ('error' in createDocumentsBody) {
      throw new Error(createDocumentsBody.error);
    }

    createDocumentsBody.forEach(({ ok, id, rev }) => {
      expect(ok).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(typeof rev).toBe('string');
    });

    // read documents
    // https://docs.couchdb.org/en/stable/api/database/bulk-api.html#db-all-docs
    const allDocuments = await fetch(`${domain}/${db}/_all_docs`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie,
      },
    });

    expect(allDocuments.status).toBe(200);

    const allDocumentsBody: Documents | Fail = await allDocuments.json();

    if ('error' in allDocumentsBody) {
      throw new Error(allDocumentsBody.error);
    }

    expect(allDocumentsBody.offset).toBe(0);
    expect(allDocumentsBody.total_rows).toBe(docs1.length);

    allDocumentsBody.rows.forEach(({ id, key, value }, i) => {
      expect(id).toBe(createDocumentsBody[i].id);
      expect(key).toBe(createDocumentsBody[i].id);
      expect(value.rev).toBe(createDocumentsBody[i].rev);
    });

    // search documents
    // https://docs.couchdb.org/en/stable/api/database/find.html#db-find
    const searchDocuments = await fetch(`${domain}/${db}/_find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie,
      },
      body: JSON.stringify({
        selector: {
          number: { $lte: 5 },
        },
        limit: 100,
        // FIXME sort is only working with indexed fields
        //sort: [{ number: 'asc' }],
      } as FindParameters<TestDocument>),
    });

    expect(searchDocuments.status).toBe(200);

    const searchDocumentsBody: Find<TestDocument> | Fail = await searchDocuments.json();

    if ('error' in searchDocumentsBody) {
      throw new Error(searchDocumentsBody.error);
    }

    [5, 4, 3, 2, 1, 0].forEach((i) => {
      expect(searchDocumentsBody.docs[i]._id).toBe(createDocumentsBody[i].id);
      expect(searchDocumentsBody.docs[i]._rev).toBe(createDocumentsBody[i].rev);
      expect(searchDocumentsBody.docs[i].title).toBe(docs1[i].title);
      expect(searchDocumentsBody.docs[i].number).toBe(docs1[i].number);
      expect(searchDocumentsBody.docs[i].boolean).toBe(docs1[i].boolean);
      expect(+new Date(searchDocumentsBody.docs[i].date)).toBe(+docs1[i].date);
    });

    // update documents
    // https://docs.couchdb.org/en/stable/api/database/bulk-api.html#updating-documents-in-bulk
    const updateDocuments = await fetch(`${domain}/${db}/_bulk_docs`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie,
      },
      body: JSON.stringify({
        docs: createDocumentsBody.map(({ id, rev }, i) => {
          return {
            _id: id,
            _rev: rev,
            ...docs2[i],
          };
        }),
      } as BulkDocumentsParameters<TestDocument>),
    });

    expect(updateDocuments.status).toBe(201);

    const updateDocumentsBody: Create[] | Fail = await updateDocuments.json();

    if ('error' in updateDocumentsBody) {
      throw new Error(updateDocumentsBody.error);
    }

    let i: number = updateDocumentsBody.length;
    while (--i >= 0) {
      const { id } = updateDocumentsBody[i];

      const res = await fetch(`${domain}/${db}/${id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Cookie,
        },
      });

      expect(res.status).toBe(200);

      const body: Document<TestDocument> | Fail = await res.json();

      if ('error' in body) {
        throw new Error(body.error);
      }

      expect(body.title).toBe(docs2[i].title);
      expect(body.number).toBe(docs2[i].number);
      expect(body.boolean).toBe(docs2[i].boolean);
      expect(+new Date(body.date)).toBe(+docs2[i].date);
    }

    // ---------------------------------------------
    // clean test database
    // ---------------------------------------------
    // deletes the specified database
    // https://docs.couchdb.org/en/stable/api/database/common.html#delete--db
    const cleanDatabase = await fetch(`${domain}/${db}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Cookie,
      },
    });

    expect(cleanDatabase.status).toBe(200);

    const cleanDatabaseBody: Success | Fail = await cleanDatabase.json();

    expect(cleanDatabaseBody).toMatchObject({ ok: true });
  });
});

```

<!-- importend -->