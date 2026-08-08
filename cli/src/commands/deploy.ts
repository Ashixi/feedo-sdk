import fs from 'fs';
import path from 'path';
import axios from 'axios';
import archiver = require('archiver');
import FormData = require('form-data');
import { Wallet } from 'ethers';
import { loadWallet } from '../utils/config';

const CONSENSUS_API_URL = process.env.FEEDO_API_URL || 'http://95.111.245.68:3000';
const SEARCH_NODES = [
  'https://api.feedo.ink',
  'https://api2.feedo.ink'
];

async function createZipFile(sourceDir: string, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const { ZipArchive } = require('archiver');
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false, (entry: any) => {
      // Force all timestamps to Jan 1, 1970 for perfect byte-level deduplication
      entry.date = new Date(0);
      return entry;
    });
    archive.finalize();
  });
}

export async function deploy(dir: string, options: { domain: string }) {
  const walletData = loadWallet();
  if (!walletData) {
    console.error('\x1b[31m%s\x1b[0m', '❌ No wallet found. Please run `feedo init` first.');
    return;
  }

  const { domain } = options;
  if (!domain.endsWith('.feedo')) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Domain must end with .feedo');
    return;
  }

  const targetDir = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Directory not found: ${targetDir}`);
    return;
  }

  const ethWallet = new Wallet(walletData.privateKey);
  const tempZipPath = path.join(process.cwd(), '.feedo-deploy.zip');

  try {
    console.log(`📦 Zipping directory ${dir}...`);
    await createZipFile(targetDir, tempZipPath);

    console.log('☁️  Uploading to FEEDO Storage Network...');
    let cid: string | null = null;
    let lastError: any = null;

        const timestamp = Date.now().toString();
        const payloadStr = `FeedoAction:POST:/upload:${timestamp}`;
        const signature = await ethWallet.signMessage(payloadStr);

        for (const node of ['http://178.18.253.94:8000']) {
            console.log(`⏳ Trying node ${node}...`);
            try {
                const formData = new FormData();
                formData.append('file', fs.createReadStream(tempZipPath));
                
                const uploadRes = await axios.post(`${node}/proxy/publish_feedo`, formData, {
                  headers: {
                    ...formData.getHeaders(),
                    'X-Feedo-Storage-Class': 'Website',
                    'X-Feedo-DID': walletData.did,
                    'X-Feedo-Timestamp': timestamp,
                    'X-Feedo-Signature': signature
                  },
              timeout: 60000 // 60s timeout to avoid getting stuck forever
            });
            
            if (uploadRes.data && uploadRes.data.cid) {
                cid = uploadRes.data.cid;
                console.log(`✅ Uploaded and indexed successfully via ${node}`);
                break; // Stop trying if successful
            }
        } catch (err: any) {
            console.log(`⚠️ Node ${node} failed: ${err.message}`);
            if (err.response && err.response.data) {
                console.log(`Response data: ${JSON.stringify(err.response.data)}`);
            }
            lastError = err;
        }
    }

    if (!cid) {
      throw new Error(`Failed to upload to all storage nodes. Last error: ${lastError?.message}`);
    }
    console.log(`✅ Uploaded! CID: ${cid}`);

    // Check if domain is already registered
    console.log(`🔍 Checking domain ${domain}...`);
    let isRegistered = false;
    let ownerDid = '';

    try {
      const resolveRes = await axios.get(`${CONSENSUS_API_URL}/resolve/${domain}`);
      if (resolveRes.data && resolveRes.data.did) {
        isRegistered = true;
        ownerDid = resolveRes.data.did;
      }
    } catch (e: any) {
      // 404 or not found means not registered
    }

    if (!isRegistered) {
      console.log('📝 Domain not registered. Registering now...');
      const payloadString = `${domain}${walletData.did}`;
      const signature = await ethWallet.signMessage(Buffer.from(payloadString, 'utf-8'));
      
      await axios.post(`${CONSENSUS_API_URL}/name/register`, {
        name: domain,
        did: walletData.did,
        public_key: walletData.publicKey,
        signature: signature
      });
      console.log('✅ Domain registered successfully.');
    } else if (ownerDid !== walletData.did) {
      console.error('\x1b[31m%s\x1b[0m', `❌ Domain ${domain} is owned by ${ownerDid}. You cannot update it.`);
      return;
    }

    console.log('🔗 Updating Content Hash (CID) for the domain...');
    const updatePayloadString = `${domain}${cid}`;
    const updateSignature = await ethWallet.signMessage(Buffer.from(updatePayloadString, 'utf-8'));

    await axios.post(`${CONSENSUS_API_URL}/name/update_cid`, {
      name: domain,
      cid: cid,
      signature: updateSignature,
      gateways: []
    });

    console.log('\n\x1b[32m%s\x1b[0m', '🚀 Success! Your site is live on the FEEDO Protocol.');
    console.log('--------------------------------------------------');
    console.log(`\x1b[36mDomain:\x1b[0m        ${domain}`);
    console.log(`\x1b[36mCID:\x1b[0m           ${cid}`);
    const subdomain = domain.replace(/\./g, '-');
    console.log(`\x1b[36mWeb2 Gateway:\x1b[0m  https://gateway.feedo.ink/${domain}`);
    console.log(`\x1b[36mSubdomain URL:\x1b[0m https://${subdomain}.gateway.feedo.ink`);
    console.log(`\x1b[36mLocal Proxy:\x1b[0m   http://localhost:8005/${domain}`);
    console.log('--------------------------------------------------');

  } catch (err: any) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Deployment failed.');
    console.error(err.message);
    if (err.response) {
      console.error(err.response.data);
    }
  } finally {
    if (fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }
  }
}
