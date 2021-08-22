export interface Config {
    sources: { host: string; secure: boolean; port?: number }[];
    cacheIntervalInSeconds: number;
}
//"http://10.20.6.10:30000"
//        "https://nexus3.onap.org:10001",
//"https://nexus3.o-ran-sc.org:10001"
