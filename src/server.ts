import * as express from 'express';
import * as http from 'http';
import SearchResult from './model/searchResult';
import * as fs from 'fs'
import RegistryCache from './services/registryCache';
import DockerRegistryClient from './clients/dockerRegistryClient';
import { Config } from './model/config';
import RegistryCacheService from './services/registryCacheService';

const PLACEHOLDER_TITLE = "{{Title}}"
const PLACEHOLDER_HEADER = "{{Header}}"
const PLACEHOLDER_CONTENT = "{{Content}}"
class DockerSearchServer {

    private config: Config;
    private app: express.Express;
    private server: http.Server;
    private registryCache: RegistryCacheService;
    private baseHtmlContent: string | null;
    public constructor(config: Config) {
        this.baseHtmlContent = null;
        this.config = config;
        this.registryCache = new RegistryCacheService(this.config);
        this.app = express();
        this.app.get("/", (req, resp) => { this.sendHome(resp); });
        this.app.get("/index.html", (req, resp) => { this.sendHome(resp); });
        this.app.get("/search.html", (req, resp) => { this.sendSearch(req, resp); });
        this.server = http.createServer(this.app);
    }

    private sendHome(response: express.Response, search = "", results: SearchResult[] = []) {
        if (!this.baseHtmlContent) {
            this.baseHtmlContent = this.loadBaseHtmlContent();
        }
        if (this.baseHtmlContent) {
            const content = this.baseHtmlContent.replace(PLACEHOLDER_TITLE, "my search").replace(PLACEHOLDER_HEADER, search).replace(PLACEHOLDER_CONTENT, this.formatResults(results));
            response.status(200).send(content);
        }
        else {
            response.status(404).end();
        }
    }

    private formatResults(results: SearchResult[]) {
        let content = "<table>";
        if (results.length > 0) {
            results.forEach(item => {
                content += `<tr>`+
                //`<td><span>${item.imageName}:${item.imageTag}</span></td>`+
                `<td><span>${item.link}</span></td>`+
                `</tr>`
            });
        }
        else {
            content+="<tr><td>nothing found</td></tr>";
        }
        content += "</table>";
        return content;
    }
    private loadBaseHtmlContent(): string | null {
        let content = null;
        if (fs.existsSync('index.html')) {

            try {
                content = fs.readFileSync('index.html').toString('utf-8');
            }
            catch (e) {
                this.warn('problem reading index.html', e);
            }
        }
        else {
            this.warn('index.html not found')
        }
        return content;
    }
    private sendSearch(request: express.Request, response: express.Response) {
        if ('q' in request.query) {
            this.debug(`search for ${request.query['q']}`)
            const results = this.doSearch(`${request.query['q']}`);
            this.sendHome(response, `${request.query['q']}`, results)

        }
        else {
            this.warn('nothing to search for');
            this.sendHome(response);
        }
    }
    private doSearch(query: string): SearchResult[] {
        const a: SearchResult[] = this.registryCache.search(query);

        return a;
    }


    private debug(message: string, error?: any) {
        this.log(`DEBUG ${message} ${error ? JSON.stringify(error) : ""}`)
    }
    private info(message: string, error?: any) {
        this.log(`DEBUG ${message} ${error ? JSON.stringify(error) : ""}`)
    }
    private warn(message: string, error?: any) {
        this.log(`DEBUG ${message} ${error ? JSON.stringify(error) : ""}`)
    }
    private error(message: string, error?: any) {
        this.log(`DEBUG ${message} ${error ? JSON.stringify(error) : ""}`)

    }
    private log(message: string) {
        console.log(`${new Date().toISOString()} ${message}`)
    }
    public start(): void {
        this.app.listen(8080);
    }
}

const server = new DockerSearchServer({ cacheIntervalInSeconds: 60 * 30, sources: [{ host: "10.20.6.10", port: 30000, secure: false, sort:"desc" }] });
server.start();