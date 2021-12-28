import { getDBUrl } from "./config";

describe('download url parsed correctly', () => {
    it('minimal', () => {
        expect(
            getDBUrl({ url: "https://packages.manjaro-sway.download/$arch/$name.db.tar.gz", name: "manjaro-sway", arch: ['x86_64','aarch64'] })
            ).toEqual(['https://packages.manjaro-sway.download/x86_64/manjaro-sway.db.tar.gz', 'https://packages.manjaro-sway.download/aarch64/manjaro-sway.db.tar.gz'])
    })

    it('maximal', () => {
        const result = getDBUrl({ url: "https://ftp.gwdg.de/pub/linux/manjaro/$branch/$repo/$arch/$repo.db.tar.gz", branch: ["stable", "testing", "unstable"], name: "manjaro", arch: ['x86_64'], repo: ["core", "community", "extra", "multilib"] })

        expect(result).toHaveLength(12)
    })
})
