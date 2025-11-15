#!/usr/bin/env node
import { Command } from 'commander';
import pkg from '../package.json';

const program = new Command();
const version = pkg.version ?? '1.0.0';

program
  .name('nestokki')
  .description('Nest CLI helper for file autocompletion.')
  .version(version, '-v, --version', 'Display CLI version');

program.parse(process.argv);
