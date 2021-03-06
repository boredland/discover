import { Db, MongoClient } from 'mongodb';
import { config as Dotenv } from "dotenv-flow";
import { Desc } from './scrape';
import { ensureIndexes } from './collections';

Dotenv({ silent: true });

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
      interface ProcessEnv {
        MONGO_URL?: string;
      }
    }
    // eslint-disable-next-line no-var
    var __MONGO__: MongoClient;
}
  

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const url = process.env.MONGO_URL!;
const client = new MongoClient(url);


export const connect = async () => {
  if (!global.__MONGO__) {
      global.__MONGO__ = await client.connect();
      await ensureIndexes();
  }
  return global.__MONGO__
}
