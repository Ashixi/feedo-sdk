import axios from 'axios';
import { loadWallet } from '../utils/config';

const API_URL = process.env.FEEDO_API_URL || 'http://95.111.245.68:3000';

export async function balance() {
  const wallet = loadWallet();
  if (!wallet) {
    console.error('\x1b[31m%s\x1b[0m', '❌ No wallet found. Please run `feedo init` first.');
    return;
  }

  try {
    const res = await axios.get(`${API_URL}/did/${wallet.did}/balance`);
    const data = res.data;
    
    if (data && data.balance !== undefined) {
      console.log(`💳 \x1b[36mBalance for ${wallet.did}:\x1b[0m ${data.balance} credits`);
    } else {
      console.log(`💳 \x1b[36mBalance for ${wallet.did}:\x1b[0m 0 credits (Account not found or empty)`);
    }

  } catch (err: any) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Failed to fetch balance.');
    console.error(err.message);
  }
}
