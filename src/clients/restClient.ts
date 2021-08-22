import fetch from "node-fetch";

class RestClient {
    private readonly baseUrl: string;

    public getRemoteUrl() {
        return this.baseUrl;
    }
    public constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async doGet<TData>(url: string): Promise<TData | undefined> {
        const init = {

        };
        const resUrl = this.baseUrl + url;
        console.log(`request for ${resUrl}`)
        const fetchResult = await fetch(resUrl, init);
        const contentType = fetchResult.headers.get("Content-Type") || fetchResult.headers.get("content-type");
        const isJson = contentType && contentType.toLowerCase().startsWith("application/json");
        try {
            const data = (isJson ? await fetchResult.json() : await fetchResult.text()) as TData;
            return data
        } catch (error) {

        }
        return undefined;

    }
}
export default RestClient;