import { Wallet } from 'ethers';
import axios from 'axios';
import { saveWallet, loadWallet } from '../utils/config';

const API_URL = process.env.FEEDO_API_URL || 'http://95.111.245.68:3000';

export async function login() {
  const existing = loadWallet();
  if (existing) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  Wallet already exists at ~/.feedo/wallet.json');
    console.log(`DID: ${existing.did}`);
    console.log('To generate a new wallet, delete the existing wallet.json file.');
    return;
  }

  console.log('Generating new FEEDO identity...');
  
  // 1. Generate standard Ethereum wallet
  const wallet = Wallet.createRandom();
  const publicKey = wallet.address; // We use the ETH address as the "public key" identifier
  const privateKey = wallet.privateKey;
  const did = `did:feedo:${publicKey}`;

  try {
    // 2. Register DID on the network (this will fund the account with 500k credits).
    //    Prove ownership by signing the canonical registration message.
    console.log('Registering DID on the consensus network...');
    const message = `feedo register ${did}`;
    const signature = await wallet.signMessage(message);
    await axios.post(`${API_URL}/did/register`, {
      did: did,
      public_key: publicKey,
      signature: signature
    });

    // 3. Save locally
    saveWallet({
      did,
      publicKey,
      privateKey,
      address: publicKey
    });

    // 4. Print vividly
    console.log('\n\x1b[32m%s\x1b[0m', '✅ Successfully created and registered FEEDO Identity!');
    console.log('\n\x1b[31m%s\x1b[0m', '🚨 IMPORTANT: BACKUP YOUR KEYS 🚨');
    console.log('--------------------------------------------------');
    console.log(`\x1b[36mDID:\x1b[0m         ${did}`);
    console.log(`\x1b[36mPublic Key:\x1b[0m  ${publicKey}`);
    console.log(`\x1b[36mPrivate Key:\x1b[0m ${privateKey}`);
    console.log('--------------------------------------------------');
    console.log('You have received 500,000 deployment credits.');
    console.log('Store your private key safely. It is required to update your domains.');

  } catch (err: any) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Failed to register DID on the network.');
    console.error(err.message);
    if (err.response) {
      console.error(err.response.data);
    }
  }
}
