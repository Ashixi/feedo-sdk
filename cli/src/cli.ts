#!/usr/bin/env node

import { Command } from 'commander';
import { login } from './commands/login';
import { balance } from './commands/balance';
import { deploy } from './commands/deploy';
import dotenv from 'dotenv';

dotenv.config();

const program = new Command();

program
  .name('feedo')
  .description('FEEDO Protocol Command Line Interface')
  .version('1.0.0');

program
  .command('init')
  .alias('login')
  .description('Initialize a new FEEDO identity (generates wallet keys)')
  .action(login);

program
  .command('balance')
  .description('Check the credit balance for your DID')
  .action(balance);

program
  .command('deploy')
  .description('Deploy a static website directory to the FEEDO network')
  .argument('<dir>', 'Directory to deploy (e.g., ./build)')
  .requiredOption('-d, --domain <domain>', 'Domain name to register (must end in .feedo)')
  .action((dir, options) => {
    deploy(dir, options);
  });

program.parse(process.argv);
