import DockerRegistryClient from "../clients/dockerRegistryClient";
import { Config } from "../model/config";
import SearchResult from "../model/searchResult";
import RegistryCache from "./registryCache";

class RegistryCacheService {
    private readonly registryCaches: RegistryCache[];

    public constructor(config: Config) {
        this.registryCaches = [];
        config.sources.forEach(src=> {
            const svc = new RegistryCache(new DockerRegistryClient(src));
            svc.startScheduledTimer(config.cacheIntervalInSeconds*1000);
            this.registryCaches.push(svc);
        });

    }
    public search(query: string): SearchResult[] {
        const a: SearchResult[] = [];
        this.registryCaches.forEach(cache=>{
            cache.search(query, a);
        });
        return a;
    }
    public stop(): void {
        this.registryCaches.forEach(svc => svc.stopScheduledTimer());
    }


}
export default RegistryCacheService;