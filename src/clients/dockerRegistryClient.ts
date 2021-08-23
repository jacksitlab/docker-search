import SearchResult from "../model/searchResult";
import RestClient from "./restClient";

interface CatalogResponse {
    repositories: string[];
}
interface CatalogTagResponse {
    name: string;
    tags: string[];
}
class DockerRegistryClient extends RestClient {

    private readonly baseHost: string;
    private readonly sort: undefined | "asc" | "desc";
    public constructor(config: { host: string; secure: boolean; port?: number, sort?: "asc" | "desc" }) {
        const scheme = config.secure ? "https" : "http";
        const baseUrl = `${scheme}://${config.host}${config.port ? `:${config.port}` : ""}`
        super(baseUrl)
        this.sort = config.sort
        this.baseHost = `${config.host}${config.port ? `:${config.port}` : ""}`
    }

    public async getCatalogImages(): Promise<string[]> {
        const response = await this.doGet<CatalogResponse>('/v2/_catalog');
        return response ? response.repositories : [];
    }
    public async getCatalogImageTags(imageName: string): Promise<string[]> {
        const response = await this.doGet<CatalogTagResponse>(`/v2/${imageName}/tags/list`);
        const tags = response && response.tags ? response.tags : [];
        const x = (this.sort == undefined || this.sort == "desc") ? 1 : -1;
        return this.sort ? tags.sort((a, b) => { return a < b ? x : -x }) : tags;
    }
    public getImageUrl(imageName: string, imageTag: string): string {
        return `${this.baseHost}/${imageName}:${imageTag}`;
    }
}
export default DockerRegistryClient;