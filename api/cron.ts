import { Queue } from "quirrel/vercel";
import { desc } from "../lib/collections";
import { scrape } from "../lib/scrape";
import https from "node:https";

const getTag = async (url: string) => {
  return new Promise<string>(function (resolve) {
    https.get(url, function (response) {
      const tag = response.headers["etag"] ?? response.headers["last-modified"];
      if (!tag)
        throw new Error("url neither provides etag, nor last-modified headers");
        resolve(tag.replace(/"/g, "").trim());
      });
  });
};

export default Queue<string>(
  "api/cron", // 👈 the route that it's reachable on
  async (downloadUrl) => {
      const descCollection = await desc();
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
  }
);
