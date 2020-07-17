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
