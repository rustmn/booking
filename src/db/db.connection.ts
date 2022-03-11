import * as pgp from 'pg-promise';
import {
  IEventContext
} from 'pg-promise/typescript/pg-promise';

function errorHandler(event: IEventContext) {
  const rels = {
    cn: 'connection-related',
    ctx: 'transaction/query'
  }

  for (const key of Object.keys(rels)) {
    if (event.hasOwnProperty(key) && event[key]) {
      throw new Error(`${rels[key]} error`);
    }
  }
  throw new Error('unexpeted error');
}

const connection_options = {
  port: 5432,
  user: 'postgres',
  password: '555200Aa',
  host: 'localhost'
}
const prepared = pgp({
  error: (error, e) => {
    errorHandler(e);
  }
});
const db = prepared(connection_options);

export default async function connect() {
  return db.connect();
}