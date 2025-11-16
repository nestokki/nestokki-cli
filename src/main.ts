#!/usr/bin/env node

import { Command } from 'commander';
import pkg from '../package.json';
import { logError, logSuccess } from './util/log-style.util';
import { handleExit } from './util/handle-exit.util';
import { generateApiModule } from './generator/module/root-module.generator';
import { generateFeatureModule } from './generator/module/feature-module.generator';
import { generateEntity } from './generator/infrastructure/entity.generator';
import { Commands, GenerationCategory } from './common/enum';
import {
  handleApiDomainName,
  handleApiFileType,
  handleGenerationType,
} from './prompt/prompt-type.handler';

const program = new Command();
const version = pkg.version ?? '1.0.0';

program
  .name('nestokki')
  .description('Nest CLI helper for file autocompletion.')
  .version(version, '-v, --version', 'Display CLI version');

program
  .command(Commands.GENERATE)
  .description('Interactively select a domain name and files to generate')
  .argument('[type]', 'Generation type (api | config | database)')
  .action(async (type) => {
    let generationType: GenerationCategory;

    if (!type) {
      try {
        const { generationType: selectedType } = await handleGenerationType();

        generationType = selectedType;
      } catch (error: unknown) {
        return handleExit(error, process);
      }
    } else {
      generationType = type;
    }

    switch (generationType) {
      case GenerationCategory.API:
        try {
          const { domainName: insertedName } = await handleApiDomainName();
          const { apiFileTypes: selectedTypes } = await handleApiFileType(generationType);

          if (selectedTypes.includes('api-module')) generateApiModule(insertedName);
          if (selectedTypes.includes('feature-module')) generateFeatureModule(insertedName);
          if (selectedTypes.includes('entity')) generateEntity(insertedName);

          logSuccess(insertedName, selectedTypes);
        } catch (error: unknown) {
          return handleExit(error, process);
        }
        break;
      case GenerationCategory.CONFIG:
        console.log('TODO: Config');
        break;
      default:
        logError(`😥 Unknown Generation type "${type}". (e.g. api, config)`);
        break;
    }
  });

program.parse(process.argv);
