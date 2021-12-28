import { Queue } from "quirrel/vercel";
import { desc, file } from "../lib/collections";
import { scrape } from "../lib/scrape";
import https from "node:https";
import logger from "../lib/logger";

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
  "cron", // 👈 the route that it's reachable on
  async (downloadUrl) => {
      logger.info(`processing ${downloadUrl}`);
      const descCollection = await desc();
      const fileCollection = await file();
      const tag = await getTag(downloadUrl);
      const repoMeta = { url: downloadUrl, tag }

      // check if we already inserted this file
      const oneFile = await fileCollection.findOne({ url: downloadUrl, tag });

      if (!oneFile) {
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
            await bulk.execute()
      }

      await fileCollection.insertOne({ url: downloadUrl, tag, createdAt: new Date() });
      logger.info(`${downloadUrl} -> ${tag} written`)
  });
