import { VercelRequest, VercelResponse } from "@vercel/node";
import { desc } from "../lib/collections";
import { getDBUrl, RepoConfig } from "../lib/config";
import { scrape } from "../lib/scrape";
import https from "node:https";

const configs: RepoConfig[] = [
    { url: "https://packages.manjaro-sway.download/$arch/$name.db.tar.gz", name: "manjaro-sway", arch: ['x86_64','aarch64'] },
    { url: "https://ftp.gwdg.de/pub/linux/manjaro/$branch/$repo/$arch/$repo.db.tar.gz", branch: ["stable", "testing", "unstable"], name: "manjaro-sway", arch: ['x86_64'], repo: ["core", "community", "extra", "multilib"] },
    { url: "https://ftp.gwdg.de/pub/linux/archlinux/$repo/os/$arch/$repo.db.tar.gz", name: "archlinux", arch: ['x86_64'], repo: ["core", "community", "extra", "multilib"] },
]

const getTag = async (url: string) => {
    return new Promise<string>(function (resolve) {
      https.get(url, function (response) {
        const tag = response.headers["etag"] ?? response.headers["last-modified"];
        if (!tag)
          throw new Error("url neither provides etag, nor last-modified headers");
          resolve(tag.replaceAll('"', "").trim());
        });
    });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const descCollection = await desc();

    await Promise.all(configs.map(config => {
        const urls = getDBUrl(config);
        return urls.map(async downloadUrl => {
            const tag = await getTag(downloadUrl);
            const repoMeta = { url: downloadUrl, tag }

            // check if we already inserted this file
            const oneDesc = await descCollection.findOne({ repoMeta });


            if (!oneDesc) {
                const bulk = descCollection.initializeUnorderedBulkOp()

                const descs = await scrape(downloadUrl);
                descs?.map(desc => {
                    bulk.find({
                        NAME: desc.NAME,
                        "repoMeta.url": {
                            $eq: downloadUrl,
                        }
                    }).upsert().replaceOne({
                        ...desc,
                        repoMeta,
                    })
                });
                bulk.find({
                    $and: [
                        {
                            "repoMeta.url": { $eq: downloadUrl }
                        }, 
                        {
                            "repoMeta.tag": { $ne: tag }
                        }
                    ]
                }).delete();

                if (bulk.batches.length > 0)
                    return bulk.execute().then(() => console.log(`${downloadUrl} -> ${tag}`))
            }
        });
    })).then(() => console.log("all done"));
}
