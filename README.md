# Feedo Protocol SDKs & CLI

Welcome to the official SDK and Developer Tools repository for the [Feedo Protocol](https://github.com/Ashixi/feedo).

Feedo is a decentralized network designed for secure storage, semantic search, and decentralized identity. This repository provides everything you need to build Web3 applications, social networks, and AI agents on top of the Feedo Network.

## Available SDKs

Choose the SDK that best fits your environment:

### 1. [TypeScript / JavaScript SDK](./typescript/README.md)
The primary SDK for building Web3 dApps, Node.js backends, React, and React Native applications.
- **NPM Package**: [`feedo-protocol-sdk`](https://www.npmjs.com/package/feedo-protocol-sdk)
- **Key Features**: Dynamic routing, E2EE file uploads, Semantic Search, Identity Management.

### 2. [Python SDK](./python/README.md)
A fully asynchronous Python SDK built on `httpx` and `asyncio`, optimized for AI Agents, Data Pipelines, and Backend services.
- **PyPI Package**: [`feedo-sdk`](https://pypi.org/project/feedo-sdk/)
- **Key Features**: High-performance async API, ECIES Encryption, EIP-191 Auth.

---

## Command Line Interface (CLI)

### 3. [Feedo CLI](./cli/README.md)
A powerful command-line tool for deploying static websites, managing decentralized domains (`.feedo`), and interacting with the network without writing code.
- **NPM Package**: [`feedo-sdk`](https://www.npmjs.com/package/feedo-sdk) (Wait, note: CLI package is published as `feedo-sdk` on npm)
- **Commands**:
  - `feedo login`: Authenticate with your private key.
  - `feedo deploy <dir>`: Upload a directory to Feedo Storage.
  - `feedo balance`: Check your network credits.

---

## Core Capabilities

By using these SDKs, developers can easily interact with all three layers of the Feedo architecture:

1. **Storage Node (`client.storage`)**
   - Decentralized, IPFS-like file storage.
   - Built-in End-to-End Encryption (AES-256-GCM + ECIES).
   - "Gas Sponsorship" & Delegated uploads support.

2. **Consensus Node (`client.consensus`)**
   - **DID Registration**: Create and manage Decentralized Identifiers.
   - **Naming Service**: Register `.feedo` domains and link them to CIDs.
   - **Access Control**: Grant other DIDs access to your private files.

3. **Search Node (`client.search`)**
   - **Semantic Search**: Native AI vector embeddings for text search.
   - **Indexing**: Make public or private documents searchable.
   - **Web2 Gateway**: HTTP gateway for fast content retrieval.

## Important Note for New Developers ⚠️

Before you can upload files or perform any write operations using these SDKs, **you must first register your DID**.
Registering your DID generates your identity on the blockchain and grants you the initial credits (500,000) required for storage.

Please refer to the `README.md` inside your specific language's folder for detailed instructions on how to register your DID.

---

## Contributing

We welcome contributions! Please feel free to submit issues, fork the repository and send pull requests.

## License

Apache License 2.0
