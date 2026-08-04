# Feedo CLI

The official Command Line Interface (CLI) for Feedo.

`feedo-sdk` allows developers and creators to seamlessly deploy static websites, Single Page Applications (SPAs), and assets directly to Feedo's decentralized storage and register `.feedo` domains on the consensus layer.

## Installation

Install the CLI globally via NPM:

```bash
npm install -g feedo-sdk
```

## CLI Reference

### `feedo init` (or `feedo login`)
Initializes a new Feedo Identity.
This command generates a new Decentralized Identifier (DID) and a cryptographic keypair (public and private keys). It also automatically registers your DID on the Feedo Consensus Node and creates a local `wallet.json` configuration file.

**Usage:**
```bash
feedo init
```
*Note: Make sure to securely back up the private key displayed in the terminal output. It is required if you ever need to restore your identity or update your domains from another machine.*

### `feedo balance`
Checks the current deployment credit balance associated with your DID. Credits are required to deploy websites or large assets.

**Usage:**
```bash
feedo balance
```

### `feedo deploy <directory> --domain <domain.feedo>`
Deploys a static directory (like a React `build` or Vue `dist` folder) to Feedo.

**Options:**
- `--domain <name.feedo>` **(Required)**: The `.feedo` domain you want to register or update. It must end with `.feedo`.

**How it works:**
1. Zips the specified local directory.
2. Uploads the archive to a Feedo Storage Node and receives a Content Identifier (CID).
3. Connects to the Consensus Node to register your `.feedo` domain (if it's new) or update it (if you already own it).
4. Links the returned CID to your domain name so it resolves globally.

**Example:**
```bash
feedo deploy ./build --domain myapp.feedo
```

## ⚠️ Troubleshooting & Common Issues

### 1. Blank Screen on React/Vite Sites (Asset 404s)
If your site deploys successfully but shows a **blank screen** on the Web2 Gateway (with only the title visible), it is likely due to absolute asset paths in your build configuration. Decentralized networks and gateways require **relative paths**.
- **For Vite**: Add `base: './'` to your `vite.config.ts` or `vite.config.js`.
- **For React Router**: Do not use `BrowserRouter` unless you access your site via the **Subdomain Gateway** (e.g., `https://your-domain-feedo.gateway.feedo.ink`). The subdomain gateway natively supports SPA routing. Otherwise, use `HashRouter`.

### 2. Balance shows 0 credits
When running `feedo balance`, you might see `0 credits` or an error immediately after running `feedo init`. **Do not worry!** The backend is currently optimizing the credit system. You can completely ignore this and proceed straight to `feedo deploy` — your site will still deploy successfully!

## Development

If you want to build or modify the CLI locally:

```bash
npm install
npm run build
```

## 🌐 Community

Join our Discord server to ask questions, meet the team, or apply for the technical co-founder role! 

👉 **[Join the Feedo Discord](https://discord.gg/9sktH22ZN)**

## License
MIT
