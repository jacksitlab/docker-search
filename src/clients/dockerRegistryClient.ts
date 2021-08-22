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

    public constructor(config: { host: string; secure: boolean; port?: number }) {
        const scheme = config.secure ? "https" : "http";
        const baseUrl = `${scheme}://${config.host}${config.port ? `:${config.port}` : ""}`
        super(baseUrl)
        this.baseHost = `${config.host}${config.port ? `:${config.port}` : ""}`
    }

    public async getCatalogImages(): Promise<string[]> {
        const response = await this.doGet<CatalogResponse>('/v2/_catalog');
        return response ? response.repositories : [];
    }
    public async getCatalogImageTags(imageName: string): Promise<string[]> {
        const response = await this.doGet<CatalogTagResponse>(`/v2/${imageName}/tags/list`);
        return response ? response.tags : [];
    }
    public getImageUrl(imageName: string, imageTag: string): string {
        return `${this.baseHost}/${imageName}:${imageTag}`;
    }
}
export default DockerRegistryClient;