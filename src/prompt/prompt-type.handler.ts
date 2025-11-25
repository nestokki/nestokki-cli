import inquirer from 'inquirer';
import { LayerCategory, RelationCategory } from '../common/enum';
import {
  getFeatureLayerTypeChoices,
  getGenerationTypeChoices,
  getOnDeleteChoices,
  getRelationBaseModuleChoices,
  getRelationTargetModuleChoices,
  getRelationTypeChoices,
} from './prompt-type.indicator';
import {
  InputDomainNameResponse,
  SelectLayerTypeResponse,
  GenerationType,
  SelectedChoices,
  SelectBaseModuleResponse,
  SelectTargetModuleResponse,
  SelectRelationTypeResponse,
  RelationOptionsResponse,
} from '../common/interface';
import { pluralize, toCamelCase, toSnakeCase } from '../util/convert-case.util';

export const handleGenerationType = async (): Promise<GenerationType> => {
  return await inquirer.prompt<GenerationType>([
    {
      type: 'list',
      name: 'generationType',
      message: 'What would you like to generate?',
      choices: getGenerationTypeChoices(),
      validate: (choice: string) => {
        if (!choice) return '😥 You must select at least one generation type.';
        return true;
      },
    },
  ]);
};

export const handleFeatureDomainName = async (): Promise<InputDomainNameResponse> => {
  const kebabRegex = /^[a-z][a-z0-9-]*$/;

  return await inquirer.prompt<InputDomainNameResponse>([
    {
      type: 'input',
      name: 'domainName',
      message: 'Enter the domain name to generate (kebab-case only):',
      validate: (input: string) => {
        if (!input.trim()) return '😥 Domain name is required.';
        if (!kebabRegex.test(input.trim())) return '😥 Kebab-case only. (e.g. user, board-comment)';
        return true;
      },
    },
  ]);
};

export const handleFeatureLayerType = async (
  domainName: string,
): Promise<SelectLayerTypeResponse> => {
  return await inquirer.prompt<SelectLayerTypeResponse>([
    {
      type: 'checkbox',
      name: 'layerTypeList',
      message: 'Which layer would you like to generate?',
      loop: false,
      choices: getFeatureLayerTypeChoices(domainName),
      validate: (choices: SelectedChoices[]) => {
        if (!choices.length) return '😥 You must select at least one layer type.';
        if (!choices.some((c) => c.value === LayerCategory.MODULE))
          return '😥 Module (api, feature) is a required selection.';
        return true;
      },
    },
  ]);
};

export const handleRelationBaseModule = async (
  modules: string[],
): Promise<SelectBaseModuleResponse> => {
  return await inquirer.prompt<SelectBaseModuleResponse>([
    {
      type: 'list',
      name: 'baseModule',
      message: 'Which module should the relation be added to? (base module)',
      loop: false,
      choices: getRelationBaseModuleChoices(modules),
      validate: (choice: string) => {
        if (!choice) return '😥 You must select one module.';
        return true;
      },
    },
  ]);
};

export const handleRelationTargetModule = async (
  modules: string[],
  base: string,
): Promise<SelectTargetModuleResponse> => {
  return await inquirer.prompt<SelectTargetModuleResponse>([
    {
      type: 'list',
      name: 'targetModule',
      message: 'Which module should it relate to? (target module)',
      loop: false,
      choices: getRelationTargetModuleChoices(modules, base),
      validate: (choice: string) => {
        if (!choice) return '😥 You must select one module.';
        return true;
      },
    },
  ]);
};

export const handleRelationType = async (): Promise<SelectRelationTypeResponse> => {
  return inquirer.prompt<SelectRelationTypeResponse>([
    {
      type: 'list',
      name: 'relationType',
      message: 'Select relation type',
      choices: getRelationTypeChoices(),
      validate: (choice: string) => {
        if (!choice) return '😥 You must select one relation type.';
        return true;
      },
    },
  ]);
};

export const handleRelationOptions = async ({
  baseModule,
  targetModule,
  relationType,
}: {
  baseModule: string;
  targetModule: string;
  relationType: RelationCategory;
}): Promise<RelationOptionsResponse> => {
  const camelRegex = /^[a-z][a-zA-Z0-9]*$/;
  const snakeRegex = /^[a-z][a-z0-9_]*$/;

  return inquirer.prompt<RelationOptionsResponse>([
    {
      type: 'input',
      name: 'propertyName',
      message: 'Property name on base entity:',
      default:
        relationType === RelationCategory.ONE_TO_MANY
          ? pluralize(toCamelCase(targetModule))
          : toCamelCase(targetModule),
      validate: (input: string) => {
        if (!input.trim()) return '😥 Property name is required.';
        if (!camelRegex.test(input.trim())) return '😥 camelCase only. (e.g. user, boardComment)';
        return true;
      },
    },
    {
      type: 'input',
      name: 'fkColumn',
      message: 'FK column name:',
      default: () =>
        relationType === RelationCategory.ONE_TO_MANY
          ? `${toSnakeCase(baseModule)}_idx`
          : `${toSnakeCase(targetModule)}_idx`,
      validate: (input: string) => {
        if (!input.trim()) return '😥 FK column name is required.';
        if (!snakeRegex.test(input.trim())) return '😥 snake_case only. (e.g. user, board_comment)';
        return true;
      },
    },
    {
      type: 'confirm',
      name: 'lazy',
      message: 'Use lazy loading?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'nullable',
      message: 'Allow null?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'cascade',
      message: 'Enable cascade?',
      default: false,
    },
    {
      type: 'list',
      name: 'onDelete',
      message: 'onDelete option:',
      choices: getOnDeleteChoices(),
    },
    {
      type: 'confirm',
      name: 'bidirectional',
      message: `Also add inverse side on ${targetModule}?`,
      default: relationType !== RelationCategory.ONE_TO_ONE, // 일단 예시 기본값
    },
    {
      type: 'input',
      name: 'inversePropertyName',
      message: 'Inverse property name on target:',
      default:
        relationType === RelationCategory.MANY_TO_ONE
          ? pluralize(toCamelCase(baseModule))
          : toCamelCase(baseModule),
      when: (answer) => answer.bidirectional,
      validate: (input: string) => {
        if (!input.trim()) return '😥 Inverse property name is required.';
        if (!camelRegex.test(input.trim()))
          return '😥 camelCase only. (e.g. users, boardCommentList)';
        return true;
      },
    },
  ]);
};
