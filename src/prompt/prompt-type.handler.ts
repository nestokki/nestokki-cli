import inquirer from 'inquirer';
import { LayerCategory, OrmCategory } from '../common/enum';
import {
  getDatabaseOrmTypeChoices,
  getFeatureLayerTypeChoices,
  getGenerationTypeChoices,
} from './prompt-type.indicator';
import {
  InputDomainNameResponse,
  SelectLayerTypeResponse,
  GenerationType,
  SelectOrmTypeResponse,
  SelectedChoices,
} from '../common/interface';

export const handleGenerationType = async (): Promise<GenerationType> => {
  return await inquirer.prompt<GenerationType>([
    {
      type: 'list',
      name: 'generationType',
      message: 'What would you like to generate?',
      choices: getGenerationTypeChoices(),
      validate: (choices: string[]) => {
        if (!choices.length) return '😥 You must select at least one generation type.';
        return true;
      },
    },
  ]);
};

export const handleDatabaseOrmType = async (): Promise<SelectOrmTypeResponse> => {
  return await inquirer.prompt<SelectOrmTypeResponse>([
    {
      type: 'checkbox',
      name: 'ormTypeList',
      message: 'Which orm would you like to generate?',
      loop: false,
      choices: getDatabaseOrmTypeChoices(),
      validate: (choices: SelectedChoices[]) => {
        if (!choices.length) return '😥 You must select at least one orm type.';
        if (!choices.some((c) => c.value === OrmCategory.MODULE))
          return '😥 Module (database) is a required selection.';
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
