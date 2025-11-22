#!/usr/bin/env node

import { Command } from 'commander';
import pkg from '../package.json';
import { logError, logSuccess } from './util/log-style.util';
import { handleExit } from './util/handle-exit.util';
import { generateApiModule } from './generator/module/api-module.generator';
import { generateFeatureModule } from './generator/module/feature-module.generator';
import { Commands, GenerationCategory, LayerCategory } from './common/enum';
import {
  handleFeatureDomainName,
  handleFeatureLayerType,
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
    let generationCategory: GenerationCategory;

    if (!type) {
      try {
        const { generationType } = await handleGenerationType();
        generationCategory = generationType;
      } catch (error: unknown) {
        return handleExit(error, process);
      }
    } else generationCategory = type;

    switch (generationCategory) {
      case GenerationCategory.FEATURE:
        try {
          const { domainName } = await handleFeatureDomainName();
          const { layerTypeList } = await handleFeatureLayerType();

          if (layerTypeList.includes(LayerCategory.MODULE)) {
            generateApiModule(domainName);
            generateFeatureModule(domainName);
          }

          // if (layerTypeList.includes('api-module')) generateApiModule(domainName);
          // if (layerTypeList.includes('feature-module')) generateFeatureModule(domainName);
          // if (layerTypeList.includes('entity')) generateEntity(domainName);

          logSuccess(domainName, layerTypeList);
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
