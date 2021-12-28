import { getDBUrl, RepoConfig } from "./config";
import { parseDesc, scrape } from "./scrape";
import fsPromises from 'node:fs/promises'

test("manjaro sway", async () => {
    const config: RepoConfig = { url: "https://packages.manjaro-sway.download/$arch/$name.db.tar.gz", name: "manjaro-sway", arch: ['x86_64','aarch64'] }
    const url = getDBUrl(config)[0]
    const result = await scrape(url);
    expect(result).not.toBeUndefined();
    expect(result?.length).toBeGreaterThan(10);
})

test("manjaro community x86", async () => {
    const config: RepoConfig =  { url: "https://ftp.gwdg.de/pub/linux/manjaro/$branch/$repo/$arch/$repo.db.tar.gz", branch: ["stable"], name: "manjaro", arch: ['x86_64'], repo: ["core"] }
    const url = getDBUrl(config)[0]
    const result = await scrape(url);
    expect(result).not.toBeUndefined();
    expect(result?.length).toBeGreaterThan(250);
})

test("parse desc", async () => {
    const descString = await fsPromises.readFile(__dirname + '/__fixtures__/calamares.desc', 'utf-8');
    const result = parseDesc(descString)
    expect(result).toMatchSnapshot()
})
