import DockerRegistryClient from "../clients/dockerRegistryClient";
import Dictionary, { IDictionary } from "../model/dictionary";
import SearchResult from "../model/searchResult";

class RegistryCache {

    private readonly client: DockerRegistryClient;
    //key=>imageTag
    //values=>imageVersion
    private readonly data: IDictionary<string[]>;
    private timerId: NodeJS.Timeout | undefined;
    public constructor(client: DockerRegistryClient, refreshIntervalInSeconds = 900) {
        this.client = client;
        this.data = new Dictionary();
    }

    public startScheduledTimer(interval: number) {
        this.stopScheduledTimer();
        const initialLoad: boolean = this.data.isEmpty();
        this.timerId = setInterval(() => { this.getData(); }, interval);
        if (initialLoad) {
            this.getData();
        }
    }
    public stopScheduledTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
        this.timerId = undefined;
    }
    private async getData() {
        let images: string[] | undefined = undefined;
        console.log("loading data")
        try {
            images = await this.client.getCatalogImages();
        }
        catch (e) {
            console.error("problem requesting registry images for " + this.client.getRemoteUrl(), e);
            return;
        }
        this.data.clear();
        if (images) {

            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                try {
                    const tags = await this.client.getCatalogImageTags(image);
                    this.data.add(image, tags)
                }
                catch (e) {
                    console.error("problem requesting image tags for " + image, e);
                    this.data.add(image, []);
                }
            }
        }

    }
    public search(query: string, results?: SearchResult[]): SearchResult[] {
        if (results == undefined) {
            results = [];
        }
        console.log(`searching for ${query} in cache for ${this.client.getRemoteUrl()}`)
        if (query.indexOf(":")) {
            const hlp = query.split(':');
            this.searchForImageAndVersion(results, hlp[0], hlp[1]);
        }
        else {
            this.searchForImage(results, query);
        }
        return results;
    }
    private searchForImageAndVersion(results: SearchResult[], imgQuery: string, versionQuery: string) {
        const imgRegexp = new RegExp(imgQuery);
        const versionRegexp = new RegExp(versionQuery);
        this.data.keySet().forEach(element => {
            if (imgRegexp.test(element.key)) {
                element.value.forEach(elemVersion => {
                    if (versionRegexp.test(elemVersion)) {
                        console.log(`found ${element.key}:${elemVersion}`);
                        results.push({ imageName: element.key, imageTag: elemVersion, link: this.client.getImageUrl(element.key, elemVersion) })
                    }
                });
            }
        });
    }
    private searchForImage(results: SearchResult[], imgQuery: string) {
        const imgRegexp = new RegExp(imgQuery);
        this.data.keySet().forEach(element => {
            element.value.forEach(elemVersion => {
                console.log(`found ${element.key}:${elemVersion}`);
                results.push({ imageName: element.key, imageTag: elemVersion, link: this.client.getImageUrl(element.key, elemVersion)  })
            });
        });
    }
}
export default RegistryCache;