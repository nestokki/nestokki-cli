declare const process: {
  argv: string[];
  exit(code?: number): never;
};

import { Command } from 'commander';
import pkg from '../package.json';

const program = new Command();
const version = pkg.version ?? '0.0.0';

program
  .name('nestokki')
  .description('Nest CLI helper for file autocompletion.')
  .version(version, '-v, --version', 'display CLI version');

const rawArgs = process.argv.slice(2);
if (rawArgs.includes('-version')) {
  console.log(version);
  process.exit(0);
}

program.parse(process.argv);
