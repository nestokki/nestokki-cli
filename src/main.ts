#!/usr/bin/env node

import { Command } from 'commander';
import pkg from '../package.json';
import { logError, logSuccess } from './util/log-style.util';
import { handleExit } from './util/handle-exit.util';
import { Commands, GenerationCategory, LayerCategory, OrmCategory } from './common/enum';
import { generateApiModule } from './generator/module/api-module.generator';
import { generateFeatureModule } from './generator/module/feature-module.generator';
import {
  handleDatabaseOrmType,
  handleFeatureDomainName,
  handleFeatureLayerType,
  handleGenerationType,
} from './prompt/prompt-type.handler';
import { generateDomain } from './generator/domain/domain.generator';
import { generateEntity } from './generator/infrastructure/entity.generator';
import { generatePropsInterface } from './generator/domain/props-interface.generator';
import { generateService } from './generator/domain/service.generator';
import { generateMapper } from './generator/infrastructure/mapper.generator';
import { generateRepository } from './generator/infrastructure/repository.generator';

const program = new Command();
const version = pkg.version ?? '1.0.0';

program
  .name('nestokki')
  .description('Nest CLI helper for file autocompletion.')
  .version(version, '-v, --version', 'Display CLI version');

program
  .command(Commands.GENERATE)
  .description('Interactively select a domain name and files to generate')
  .argument('[type]', 'Generation type (database | feature)')
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
      case GenerationCategory.DATABASE:
        try {
          const { ormTypeList } = await handleDatabaseOrmType();

          if (ormTypeList.includes(OrmCategory.MODULE)) {
            console.log('😥 Database module is not available yet.');
          }
          if (ormTypeList.includes(OrmCategory.TYPEORM)) {
            console.log('😥 Database typeorm is not available yet.');
          }
          if (ormTypeList.includes(OrmCategory.PRISMA)) {
            console.log('😥 Database prisma is not available yet.');
          }

          return;
          logSuccess('DataBase', ormTypeList);
        } catch (error: unknown) {
          return handleExit(error, process);
        }
      case GenerationCategory.FEATURE:
        try {
          const { domainName } = await handleFeatureDomainName();
          const { layerTypeList } = await handleFeatureLayerType();

          if (layerTypeList.includes(LayerCategory.MODULE)) {
            generateApiModule(domainName);
            generateFeatureModule(domainName);
          }

          if (layerTypeList.includes(LayerCategory.DOMAIN)) {
            generatePropsInterface(domainName);
            generateDomain(domainName);
            generateService(domainName);
          }

          if (layerTypeList.includes(LayerCategory.INFRASTRUCTURE)) {
            generateEntity(domainName);
            generateMapper(domainName);
            generateRepository(domainName);
          }

          logSuccess(domainName, layerTypeList);
        } catch (error: unknown) {
          return handleExit(error, process);
        }
        break;
      default:
        logError(`😥 Unknown Generation type "${type}". (e.g. database, feature)`);
        break;
    }
  });

program.parse(process.argv);
