import httpx
from typing import Dict, Any, Optional
from ..router import NodeRouter

class SearchModule:
    def __init__(self, router: NodeRouter):
        self.router = router

    async def _request(self, method: str, path: str, json: Optional[Dict] = None, params: Optional[Dict] = None) -> Any:
        base_url = await self.router.get_search_node()
        url = f"{base_url}{path}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.request(method, url, json=json, params=params)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Search request failed on {base_url}, finding new node...")
                self.router.invalidate_search_node()
                base_url = await self.router.get_search_node()
                url = f"{base_url}{path}"
                response = await client.request(method, url, json=json, params=params)
                response.raise_for_status()
                return response.json()

    async def query(self, query_text: str, limit: int = 10):
        return await self._request("GET", "/query", params={"q": query_text, "limit": limit})

    async def index_document(self, content: str, metadata: Optional[Dict] = None):
        return await self._request("POST", "/index_document", json={"content": content, "metadata": metadata or {}})

    async def deploy_proxy(self, directory_path: str, domain: str):
        return await self._request("POST", "/proxy/publish_feedo", json={"source_dir": directory_path, "domain": domain})

    async def unpin(self, cid: str):
        return await self._request("DELETE", f"/proxy/unpin_feedo/{cid}")

    async def get_stats(self):
        return await self._request("GET", "/explorer/stats")
