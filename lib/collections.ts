import { Desc } from "./scrape";
import { connect } from "./db";

type DescItem = Desc & { repoMeta: { tag: string, url: string } }

export const desc = async () => (await connect()).db().collection<DescItem>('desc');

type DBFile = {
    url: string;
    createdAt: Date;
    tag: string;
}

export const file = async () => (await connect()).db().collection<DBFile>('file');

export const ensureIndexes = async () => {
    await (await desc()).createIndex(
        { "repoMeta.tag": 1, NAME: 1, "repoMeta.url": 1 }, 
        {
            unique: true,
        }
    );
}
