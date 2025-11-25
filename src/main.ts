#!/usr/bin/env node

import { Command } from 'commander';
import pkg from '../package.json';
import { logError, logFeatureSuccess, logRelationSuccess } from './util/log-style.util';
import { handleExit } from './util/handle-exit.util';
import { Commands, GenerationCategory, LayerCategory } from './common/enum';
import { generateApiModule } from './generator/module/api-module.generator';
import { generateFeatureModule } from './generator/module/feature-module.generator';
import {
  handleFeatureDomainName,
  handleFeatureLayerType,
  handleGenerationType,
  handleRelationBaseModule,
  handleRelationOptions,
  handleRelationTargetModule,
  handleRelationType,
} from './prompt/prompt-type.handler';
import { generateDomain } from './generator/domain/domain.generator';
import { generateEntity } from './generator/infrastructure/entity.generator';
import { generatePropsInterface } from './generator/domain/props-interface.generator';
import { generateService } from './generator/domain/service.generator';
import { generateMapper } from './generator/infrastructure/mapper.generator';
import { generateRepository } from './generator/infrastructure/repository.generator';
import { getModules } from './util/parse-module.util';
import { generateRelation } from './generator/infrastructure/relation.generator';
import { generateUseCase } from './generator/application/use-case.generator';
import { generateController } from './generator/presentation/controller.generator';

const program = new Command();
const version = pkg.version ?? '1.0.0';

program
  .name('nestokki')
  .description('Nest CLI helper for file autocompletion.')
  .version(version, '-v, --version', 'Display CLI version');

program
  .command(Commands.GENERATE)
  .description('Interactively select a domain name and files to generate')
  .argument('[type]', 'Generation type (e.g. feature, relation)')
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
          const { layerTypeList } = await handleFeatureLayerType(domainName);

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

          if (layerTypeList.includes(LayerCategory.APPLICATION)) {
            generateUseCase(domainName);
          }

          if (layerTypeList.includes(LayerCategory.PRESENTATION)) {
            generateController(domainName);
          }

          logFeatureSuccess(domainName, layerTypeList);
        } catch (error: unknown) {
          return handleExit(error, process);
        }
        break;
      case GenerationCategory.RELATION:
        try {
          const modules = getModules();

          if (!modules.length) {
            logError('😥 No modules available for relations.');
            logError('👉 You have to generate a feature module(with an entity) first!');
            return;
          }

          if (modules.length < 2) {
            logError('😥 Self-referential relations are not supported yet.');
            logError(
              `👉 You only have "${modules[0]}" registered right now. Please generate another module.`,
            );

            return;
          }

          const { baseModule } = await handleRelationBaseModule(modules);
          const { targetModule } = await handleRelationTargetModule(modules, baseModule);
          const { relationType } = await handleRelationType();

          const options = await handleRelationOptions({ baseModule, targetModule, relationType });

          generateRelation({ baseModule, targetModule, relationType, options });

          logRelationSuccess(baseModule, targetModule, relationType);
          return;
        } catch (error: unknown) {
          return handleExit(error, process);
        }
      default:
        logError(`😥 Unknown Generation type "${type}". (e.g. feature, relation)`);
        break;
    }
  });

program.parse(process.argv);
