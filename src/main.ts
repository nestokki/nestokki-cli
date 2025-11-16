#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import pkg from '../package.json';
import { logError, logSuccess } from './util/log-style.util';
import { generateRootModule } from './generator/module/root-module.generator';
import { generateFeatureModule } from './generator/module/feature-module.generator';
import { generateEntity } from './generator/infrastructure/entity.generator';

const program = new Command();
const version = pkg.version ?? '1.0.0';

program
  .name('nestokki')
  .description('Nest CLI helper for file autocompletion.')
  .version(version, '-v, --version', 'Display CLI version');

program
  .command('g')
  .description('Interactively select a domain name and files to generate')
  .argument('[type]', 'Creation type (api | config | database | core | infra | swagger ...)')
  .action(async (type) => {
    // TODO: 유형별 분기 처리
    try {
      const { domainName } = await inquirer.prompt<{
        domainName: string;
      }>([
        {
          type: 'input',
          name: 'domainName',
          message: 'Enter the domain name to generate (kebab-case only):',
          validate: (input: string) => {
            if (!input.trim()) return '😥 Domain name is required.';
            if (!/^[a-z][a-z0-9-]*$/.test(input.trim())) {
              return '😥 Kebab-case only. (e.g. user, board-comment)';
            }
            return true;
          },
        },
      ]);

      const { fileTypes } = await inquirer.prompt<{
        fileTypes: string[];
      }>([
        {
          type: 'checkbox',
          name: 'fileTypes',
          message: 'Which file would you like to generate?',
          loop: false,
          choices: [
            { name: 'Module (root)', value: 'root-module', checked: true },
            { name: 'Module (feature)', value: 'feature-module' },
            { name: 'Entity (infrastructure)', value: 'entity' },
            { name: 'Mapper (infrastructure)', value: 'mapper' },
            { name: 'Repository (infrastructure)', value: 'repository' },
            { name: 'Domain (domain)', value: 'domain' },
            { name: 'Service (domain)', value: 'service' },
            { name: 'UseCase (application)', value: 'use-case' },
            { name: 'Controller (presentation)', value: 'controller' },
          ],
          validate: (choices: string[]) => {
            if (!choices.length) return '😥 You must select at least one file type.';
            return true;
          },
        },
      ]);

      if (fileTypes.includes('root-module')) generateRootModule(domainName);
      if (fileTypes.includes('feature-module')) generateFeatureModule(domainName);
      if (fileTypes.includes('entity')) generateEntity(domainName);

      if (fileTypes.includes('repository')) {
        console.log('TODO: Repository');
        // generateRepository(domainName);
      }
      if (fileTypes.includes('mapper')) {
        console.log('TODO: Mapper');
        // generateMapper(domainName);
      }
      if (fileTypes.includes('domain')) {
        console.log('TODO: Domain');
        // generateDomain(domainName);
      }
      if (fileTypes.includes('service')) {
        console.log('TODO: Service');
        // generateService(domainName);
      }
      if (fileTypes.includes('use-case')) {
        console.log('TODO: UseCase');
        // generateUseCase(domainName);
      }
      if (fileTypes.includes('controller')) {
        console.log('TODO: Controller');
        // generateController(domainName);
      }

      logSuccess(domainName, fileTypes);
    } catch (error: unknown) {
      if (error && (error as any).name === 'ExitPromptError') process.exit(0);
      logError(error);
      process.exit(1);

      // if (error && (error as any).name === 'ExitPromptError') process.exit(0);
      // else if (typeof error === 'string') process.exit(1);
      // else {
      //   logError(error);
      //   process.exit(1);
      // }
    }
  });

program.parse(process.argv);
