import { Wallet } from 'ethers';
import { createHmac } from 'crypto';
import axios from 'axios';
import { loadWallet } from '../utils/config';

const API_URL = process.env.FEEDO_API_URL || 'http://95.111.245.68:3000';

function deriveUsageKey(walletPrivateKeyHex: string) {
  const skBytes = Buffer.from(walletPrivateKeyHex.replace('0x', ''), 'hex');
  const digest = createHmac('sha256', skBytes).update('feedo/usage-key/v1').digest();
  let usageInt = BigInt('0x' + digest.toString('hex'));
  const n = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
  usageInt = usageInt % n;
  if (usageInt === 0n) usageInt = 1n;
  const usageHex = usageInt.toString(16).padStart(64, '0');
  const usageWallet = new Wallet('0x' + usageHex);
  return { privateKey: '0x' + usageHex, address: usageWallet.address };
}

export async function usageKey() {
  const existing = loadWallet();
  if (!existing) {
    console.log('\x1b[31m%s\x1b[0m', '❌ No wallet found. Run `feedo init` first.');
    return;
  }
  const usage = deriveUsageKey(existing.privateKey);
  console.log('\x1b[36m%s\x1b[0m', 'Derived usage key — safe to put in env on a server:');
  console.log(`  Owner DID:       ${existing.did}`);
  console.log(`  Usage key addr:  ${usage.address}`);
  console.log(`  Usage private:   ${usage.privateKey}`);
  console.log('');
  console.log('Keep the wallet key offline. Put ONLY the usage private key in env.');
  console.log('Then run `feedo delegate` once to register the delegation.');
}

export async function delegate() {
  const existing = loadWallet();
  if (!existing) {
    console.log('\x1b[31m%s\x1b[0m', '❌ No wallet found. Run `feedo init` first.');
    return;
  }
  const wallet = new Wallet(existing.privateKey);
  const usage = deriveUsageKey(existing.privateKey);
  const message = `feedo delegate usage to ${usage.address}`;
  const signature = await wallet.signMessage(message);
  console.log('Registering delegation on the consensus network...');
  await axios.post(`${API_URL}/did/delegate`, {
    did: existing.did,
    usage_key: usage.address,
    signature,
  });
  console.log('\x1b[32m%s\x1b[0m', `✅ Delegated ${existing.did} → ${usage.address}`);
}
