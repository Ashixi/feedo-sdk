import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.feedo');
const WALLET_PATH = path.join(CONFIG_DIR, 'wallet.json');

export interface WalletData {
  did: string;
  publicKey: string;
  privateKey: string;
  address: string;
}

export function saveWallet(data: WalletData) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(WALLET_PATH, JSON.stringify(data, null, 2));
}

export function loadWallet(): WalletData | null {
  if (!fs.existsSync(WALLET_PATH)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(WALLET_PATH, 'utf-8');
    return JSON.parse(raw) as WalletData;
  } catch (e) {
    return null;
  }
}
