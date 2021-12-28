import { RepoConfig } from "./config";
import { parseDesc, scrape } from "./scrape";
import fsPromises from 'node:fs/promises'

test("manjaro sway aarch64", async () => {
    const config: RepoConfig = { url: "https://packages.manjaro-sway.download/", name: "manjaro-sway", architecture: 'aarch64' }
    const result = await scrape(config);
    expect(result).not.toBeUndefined();
    expect(result?.length).toBeGreaterThan(10);
})

test("manjaro sway x86", async () => {
    const config: RepoConfig = { url: "https://packages.manjaro-sway.download/", name: "manjaro-sway", architecture: 'x86_64' }
    const result = await scrape(config);
    expect(result).not.toBeUndefined();
    expect(result?.length).toBeGreaterThan(10);
})

test("manjaro community x86", async () => {
    const config: RepoConfig = { url: "https://ftp.gwdg.de/pub/linux/manjaro/", name: "manjaro", architecture: 'x86_64', branch: "stable", repo: "community" }
    const result = await scrape(config);
    expect(result).not.toBeUndefined();
    expect(result?.length).toBeGreaterThan(8000);
})

test("parse desc", async () => {
    const descString = await fsPromises.readFile(__dirname + '/__fixtures__/calamares.desc', 'utf-8');
    const result = parseDesc(descString)
    expect(result).toMatchSnapshot()
})
