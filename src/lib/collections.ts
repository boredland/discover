import { Desc } from "./scrape";
import { RepoConfig } from "./config";
import { connect } from "./db";

type Collection<T> = { repoMeta: RepoConfig & { tag: string } } & T

export const desc = async () => (await connect()).db().collection<Collection<Desc>>('desc');
