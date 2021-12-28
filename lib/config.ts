type Architecture = 'x86_64' | 'aarch64';

export type RepoConfig = {
    url: string;
    name: string;
    repo?: string[];
    branch?: string[];
    arch?: Architecture[];
}

const explode = (config: RepoConfig, instruction: { key: string, value?: string[]}) => {
    if (!instruction.value) return [config]

    return instruction.value.map(v => {
        return { ...config, [instruction.key]: [v] }
    })
}

export const getDBUrl = (repoConfig: RepoConfig) => {
    const levels = [
        { key: 'repo', value: repoConfig.repo }, 
        { key: "branch", value: repoConfig.branch }, 
        { key: "arch", value: repoConfig.arch }]
        .filter(({ value }) => value?.length ?? 0 > 0)
        .sort((a,b) => {
            return (a.value?.length ?? 0) > (b.value?.length ?? 0) ? 1 : -1;
        });

    let configs: RepoConfig[] = [repoConfig];

    for (const level of levels) {
        configs = configs.map(config => { 
            return explode(config, level)
        }).flat()
    }

    const urls: string[] = [];
    for (const config of configs) {
        let url = config.url;

        url = url.replace(/\$name/g, config.name)

        if (config.repo && config.repo[0])
            url = url.replace(/\$repo/g, config.repo[0])

        if (config.branch && config.branch[0])
            url = url.replace(/\$branch/g, config.branch[0])

        if (config.arch && config.arch[0]) {
            url = url.replace(/\$arch/g, config.arch[0])
        }

        urls.push(url)
    }
    return urls
}
