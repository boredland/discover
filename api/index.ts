import { VercelRequest, VercelResponse } from "@vercel/node";
import { getDBUrl, RepoConfig } from "../lib/config";
import cron from "./cron";

const configs: RepoConfig[] = [
    { url: "https://packages.manjaro-sway.download/$arch/$name.db.tar.gz", name: "manjaro-sway", arch: ['x86_64','aarch64'] },
    { url: "https://ftp.gwdg.de/pub/linux/manjaro/$branch/$repo/$arch/$repo.db.tar.gz", branch: ["stable", "testing", "unstable"], name: "manjaro", arch: ['x86_64'], repo: ["core", "community", "extra", "multilib"] },
    { url: "https://ftp.gwdg.de/pub/linux/archlinux/$repo/os/$arch/$repo.db.tar.gz", name: "archlinux", arch: ['x86_64'], repo: ["core", "community", "extra", "multilib"] },
]

const between = (min: number, max: number)  => {  
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {

    const todo = configs.map(config => {
        const urls = getDBUrl(config);
        return cron.enqueueMany(urls.map(url => ({ payload: url, options: {
            override: false,
            id: url,
            delay: `${between(0, 5)}m`,
            repeat: {
                every: '10m'
            }
        } })));
    });

    await Promise.all(todo);
    res.status(200).json({ queued: "ok"});
}
