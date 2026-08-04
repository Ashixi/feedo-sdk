import axios from 'axios';
import { NodeRouter } from '../router';

export class SearchModule {
    constructor(private router: NodeRouter) {}

    private async request(method: string, path: string, data?: any) {
        let baseUrl = await this.router.getSearchNode();
        let url = `${baseUrl}${path}`;
        
        try {
            const response = await axios({ method, url, data });
            return response.data;
        } catch (error: any) {
            // Basic retry logic with a new node on failure
            console.warn(`Search request failed on ${baseUrl}, trying to find a new node...`);
            this.router.invalidateSearchNode();
            baseUrl = await this.router.getSearchNode();
            url = `${baseUrl}${path}`;
            const retryResponse = await axios({ method, url, data });
            return retryResponse.data;
        }
    }

    async query(queryText: string, limit: number = 10) {
        return this.request('GET', `/query?q=${encodeURIComponent(queryText)}&limit=${limit}`);
    }

    async indexDocument(content: string, metadata: Record<string, any> = {}) {
        return this.request('POST', '/index_document', { content, metadata });
    }

    async deployProxy(directoryPath: string, domain: string) {
        return this.request('POST', '/proxy/publish_feedo', { source_dir: directoryPath, domain });
    }

    async unpin(cid: string) {
        return this.request('DELETE', `/proxy/unpin_feedo/${cid}`);
    }

    async getStats() {
        return this.request('GET', '/explorer/stats');
    }
}
