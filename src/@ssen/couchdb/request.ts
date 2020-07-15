export interface SessionParameters {
  name: string;
  password: string;
}

export interface PutDatabaseParameters {
  q?: number; // = 8
  n?: number; // = 3
  partitioned: boolean; // = false
}

export type PostDatabaseParameters<T extends {}> = {
  batch?: 'ok';
} & T;

export type PutDocumentParameters<T extends {}> = {
  rev?: string; // or using "If-Match" http header
  batch?: 'ok';
  new_edits?: boolean; // = true
} & T;

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
